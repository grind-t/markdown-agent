# Examples

## How to Deploy Deno to AWS Lambda

> Step-by-step tutorial on deploying Deno applications to AWS Lambda. Learn about Docker containerization, ECR repositories, function configuration, and how to set up serverless Deno apps on AWS.

### Step 2: Create a Dockerfile

Create a new file named `Dockerfile` with the following content:

```Dockerfile
## Set up the base image
FROM public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 AS aws-lambda-adapter
FROM denoland/deno:bin-1.45.2 AS deno_bin
FROM debian:bookworm-20230703-slim AS deno_runtime
COPY --from=aws-lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=deno_bin /deno /usr/local/bin/deno
ENV PORT=8000
EXPOSE 8000
RUN mkdir /var/deno_dir
ENV DENO_DIR=/var/deno_dir

## Copy the function code
WORKDIR "/var/task"
COPY . /var/task

## Warmup caches
RUN timeout 10s deno run -A main.ts || [ $? -eq 124 ] || exit 1

CMD ["deno", "run", "-A", "main.ts"]
```

### Step 3: Build the Docker Image

Build the Docker image using the following command:

```bash
docker build -t hello-world .
```

### Step 4: Create an ECR Docker repository and push the image

With the AWS CLI, create an ECR repository and push the Docker image to it:

```bash
aws ecr create-repository --repository-name hello-world --region us-east-1 | grep repositoryUri
```

Authenticate Docker with ECR, using the repository URI from the previous step:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
```

```bash
docker tag hello-world:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/hello-world:latest
```

Finally, push the Docker image to the ECR repository, using the repository URI
from the previous steps:

```bash
docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/hello-world:latest
```

### Step 5: Create an AWS Lambda function

Now you can create a new AWS Lambda function from the AWS Management Console.

1. Go to the AWS Management Console and
   [navigate to the Lambda service](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1).
2. Click on the "Create function" button.
3. Choose "Container image".
4. Enter a name for the function, like "hello-world".
5. Click on the "Browse images" button and select the image you pushed to ECR.
6. Click on the "Create function" button.
7. Wait for the function to be created.
8. In the "Configuration" tab, go to the "Function URL" section and click on
   "Create function URL".
9. Choose "NONE" for the auth type (this will make the lambda function publicly
   accessible).
10. Click on the "Save" button.

## Deploy Deno to Amazon Lightsail

> Step-by-step tutorial on deploying Deno applications to AWS Lightsail. Learn about Docker containers, GitHub Actions automation, continuous deployment, and how to set up cost-effective cloud hosting for Deno apps.

### Create Dockerfile and docker-compose.yml

To focus on the deployment, our app will simply be a `main.ts` file that returns
a string as an HTTP response:

```ts
import { Application } from "jsr:@oak/oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello from Deno and AWS Lightsail!";
});

await app.listen({ port: 8000 });
```

In our `Dockerfile`, let's add:

```Dockerfile
FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD . /app

RUN deno install --entrypoint main.ts

CMD ["run", "--allow-net", "main.ts"]
```

Then, in our `docker-compose.yml`:

```yml
version: "3"

services:
  web:
    build: .
    container_name: deno-container
    image: deno-image
    ports:
      - "8000:8000"
```

### Build, Tag, and Push to Docker Hub

First, let's sign into [Docker Hub](https://hub.docker.com/repositories) and
create a repository. Let's name it `deno-on-aws-lightsail`.

Then, let's tag and push our new image, replacing `username` with yours:

Then, let's build the image locally. Note our `docker-compose.yml` file will
name the build `deno-image`.

```shell
docker compose -f docker-compose.yml build
```

Let's [tag](https://docs.docker.com/engine/reference/commandline/tag/) the local
image with `{{ username }}/deno-on-aws-lightsail`:

```shell
docker tag deno-image {{ username }}/deno-on-aws-lightsail
```

We can now push the image to Docker Hub:

### Create and Deploy to a Lightsail Container

Let's head over to
[the Amazon Lightsail console](https://lightsail.aws.amazon.com/ls/webapp/home/container-services).

Then click "Containers" and "Create container service". Half way down the page,
click "Setup your first Deployment" and select "Specify a custom deployment".

In `Image`, be sure to use `{{ username }}/{{ image }}` that you have set in
your Docker Hub. For this example, it is `lambtron/deno-on-aws-lightsail`.

After a few moments, your new container should be deployed. Click on the public
address and you should see your Deno app:

### Automate using GitHub Actions

In order to automate that process, we'll use the `aws` CLI with the
[`lightsail` subcommand](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/lightsail/push-container-image.html).

The steps in our GitHub Actions workflow will be:

1. Checkout the repo
2. Build our app as a Docker image locally
3. Install and authenticate AWS CLI
4. Push local Docker image to AWS Lightsail Container Service via CLI

Pre-requisites for this GitHub Action workflow to work:

- an AWS Lightsail Container Instance is created (see section above)
- IAM user and relevant permissions set.
  ([Learn more about managing access to Amazon Lightsail for an IAM user.](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-managing-access-for-an-iam-user.html))
- `AWS_ACCESS_KEY_ID` and `AWS_SUCCESS_ACCESS_KEY` for your user with
  permissions. (Follow
  [this AWS guide](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/lightsail-how-to-set-up-access-keys-to-use-sdk-api-cli)
  to get generate an `AWS_ACCESS_KEY_ID` and `AWS_SUCCESS_ACCESS_KEY`.)

Let's create a new file `container.template.json`, which contains configuration
for how to make the service container deployment. Note the similarities these
option values have with the inputs we entered manually in the previous section.

```json
{
  "containers": {
    "app": {
      "image": "",
      "environment": {
        "APP_ENV": "release"
      },
      "ports": {
        "8000": "HTTP"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "app",
    "containerPort": 8000,
    "healthCheck": {
      "healthyThreshold": 2,
      "unhealthyThreshold": 2,
      "timeoutSeconds": 5,
      "intervalSeconds": 10,
      "path": "/",
      "successCodes": "200-499"
    }
  }
}
```

Let's add the below to your `.github/workflows/deploy.yml` file:

```yml
name: Build and Deploy to AWS Lightsail

on:
  push:
    branches:
      - main

env:
  AWS_REGION: us-west-2
  AWS_LIGHTSAIL_SERVICE_NAME: container-service-2
jobs:
  build_and_deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main
        uses: actions/checkout@v4

      - name: Install Utilities
        run: |
          sudo apt-get update
          sudo apt-get install -y jq unzip
      - name: Install AWS Client
        run: |
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
          unzip awscliv2.zip
          sudo ./aws/install || true
          aws --version
          curl "https://s3.us-west-2.amazonaws.com/lightsailctl/latest/linux-amd64/lightsailctl" -o "lightsailctl"
          sudo mv "lightsailctl" "/usr/local/bin/lightsailctl"
          sudo chmod +x /usr/local/bin/lightsailctl
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-region: ${{ env.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Build Docker Image
        run: docker build -t ${{ env.AWS_LIGHTSAIL_SERVICE_NAME }}:release .
      - name: Push and Deploy
        run: |
          service_name=${{ env.AWS_LIGHTSAIL_SERVICE_NAME }}
          aws lightsail push-container-image \
            --region ${{ env.AWS_REGION }} \
            --service-name ${service_name} \
            --label ${service_name} \
            --image ${service_name}:release
          aws lightsail get-container-images --service-name ${service_name} | jq --raw-output ".containerImages[0].image" > image.txt
          jq --arg image $(cat image.txt) '.containers.app.image = $image' container.template.json > container.json
          aws lightsail create-container-service-deployment --service-name ${service_name} --cli-input-json file://$(pwd)/container.json
```

```shell
docker build -t ${{ env.AWS_LIGHTSAIL_SERVICE_NAME }}:release .
```

```shell
aws lightsail push-container-image ...
```

This command pushes the local image to our Lightsail container.

This command uses the image name saved in `image.txt` and
`container.template.json` and creates a new options file called
`container.json`. This options file will be passed to `aws lightsail` for the
final deployment in the next step.

```shell
aws lightsail create-container-service-deployment --service-name ${service_name} --cli-input-json file://$(pwd)/container.json
```

## Deploying Deno to Cloudflare Workers

> Step-by-step tutorial on deploying Deno functions to Cloudflare Workers. Learn how to configure denoflare, create worker modules, test locally, and deploy your code to Cloudflare's global edge network.

### Setup `denoflare`

In order to deploy Deno to Cloudflare, we'll use this community created CLI
[`denoflare`](https://denoflare.dev/).

[Install it](https://denoflare.dev/cli/#installation):

```shell
deno install --unstable-worker-options --allow-read --allow-net --global --allow-env --allow-run --name denoflare --force \
https://raw.githubusercontent.com/skymethod/denoflare/v0.6.0/cli/cli.ts
```

### Create your function

In a new directory, let's create a `main.ts` file, which will contain our Module
Worker function:

```ts
export default {
  fetch(request: Request): Response {
    return new Response("Hello, world!");
  },
};
```

At the very minimum, a Module Worker function must `export default` an object
that exposes a `fetch` function, which returns a `Response` object.

You can test this locally by running:

### Configure `.denoflare`

The next step is to create a `.denoflare` config file. In it, let's add:

```json
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.11/common/config.schema.json",
  "scripts": {
    "main": {
      "path": "/absolute/path/to/main.ts",
      "localPort": 8000
    }
  },
  "profiles": {
    "myprofile": {
      "accountId": "abcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "apiToken": "abcxxxxxxxxx_-yyyyyyyyyyyy-11-dddddddd"
    }
  }
}
```

You can find your `accountId` by going to your
[Cloudflare dashboard](https://dash.cloudflare.com/), clicking "Workers", and
finding "Account ID" on the right side.

You can generate an `apiToken` from your
[Cloudflare API Tokens settings](https://dash.cloudflare.com/profile/api-tokens).
When you create an API token, be sure to use the template "Edit Cloudflare
Workers".

## Deploy an app with Deno Deploy

> A step-by-step tutorial for deploying your first Deno application to Deno Deploy.

Deno Deploy allows you to host your Deno applications on a global edge network,
with built in telemetry and CI/CD tooling.

### Create a GitHub repository

1. Go to [GitHub](https://github.com) and create a new repository.

2. Initialize your local directory as a Git repository:

```sh
git init
git add .
git commit -m "Initial commit"
```

3. Add your GitHub repository as a remote and push your code:

```sh
git remote add origin https://github.com/your-username/my-first-deno-app.git
git branch -M main
git push -u origin main
```

### Create a Deno Deploy organization

1. Navigate to [console.deno.com](https://console.deno.com)
2. Click "+ New Organization"
3. Select the 'Standard Deploy' organization type
4. Enter an organization name and slug (this cannot be changed later)
5. Click "Create Standard Deploy organization"

### Create and deploy your application

1. Click "+ New App"
2. Select the GitHub repository you created earlier
3. The app configuration should be automatically detected, but you can verify
   these settings by clicking the "Edit build config" button:
   - Framework preset: No preset
   - Runtime configuration: Static Site
   - Install command: `deno install`
   - Build command: `deno task build`
   - Static Directory: `dist`

4. Click "Create App" to start the deployment process

### Make changes and redeploy

Let's update the application and see how changes are deployed:

Update your `main.ts` file locally:

```ts title="main.ts"
import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Hello from Deno Deploy!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
```

2. Commit and push your changes:

```sh
git add .
git commit -m "Update application"
git push
```

Return to your Deno Deploy dashboard to see a new build automatically start.
Once the build completes, visit your application URL to see the update.

## Deploy an app with the deno deploy command

> Step-by-step tutorial for using the deno deploy CLI command to create and deploy your first application to Deno Deploy.

If you already have an app to deploy you can skip to
[Deploying your application](#deploy-your-application), or read on to make and
then deploy a simple app.

### Create a simple web application

First, let's create a basic HTTP server that will serve as our application.

Create a new directory for your project and navigate into it:

```bash
mkdir my-deploy-app
cd my-deploy-app
```

Initialize a new Deno project:

```bash
deno init
```

Replace the contents of `main.ts` with a simple HTTP server:

```ts title="main.ts"
Deno.serve({ port: 8000 }, (req) => {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "unknown";
  const timestamp = new Date().toISOString();

  // Log every request
  console.log(
    `[${timestamp}] ${req.method} ${url.pathname} - User-Agent: ${userAgent}`,
  );

  // Simple routing
  if (url.pathname === "/") {
    console.log("Serving home page");
    return new Response(
      `
      <html>
        <head><title>My Deploy App</title></head>
        <body>
          <h1>Welcome to My Deploy App!</h1>
          <p>This app was deployed using the deno deploy command.</p>
          <nav>
            <a href="/about">About</a> | 
            <a href="/api/status">API Status</a> |
            <a href="/api/error">Test Error</a>
          </nav>
        </body>
      </html>
    `,
      {
        headers: { "content-type": "text/html" },
      },
    );
  }

  if (url.pathname === "/about") {
    console.log("Serving about page");
    return new Response(
      `
      <html>
        <head><title>About - My Deploy App</title></head>
        <body>
          <h1>About This App</h1>
          <p>This is a simple demonstration of deploying with the deno deploy CLI.</p>
          <p>Check the logs to see request information!</p>
          <a href="/">← Back to Home</a>
        </body>
      </html>
    `,
      {
        headers: { "content-type": "text/html" },
      },
    );
  }

  if (url.pathname === "/api/status") {
    const responseData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "API is running successfully",
      requestCount: Math.floor(Math.random() * 1000) + 1, // Simulate request counter
    };

    console.log("API status check - all systems operational");
    console.log(`Response data:`, responseData);

    return Response.json(responseData);
  }

  if (url.pathname === "/api/error") {
    // This endpoint demonstrates error logging
    console.error("Error endpoint accessed - demonstrating error logging");
    console.warn("This is a warning message that will appear in logs");

    return Response.json({
      error: "This is a test error for demonstration",
      timestamp: new Date().toISOString(),
      tip: "Check the logs with: deno deploy logs",
    }, { status: 500 });
  }

  // 404 for all other routes
  console.warn(`404 - Route not found: ${url.pathname}`);
  return new Response("Not Found", { status: 404 });
});
```

#### Test your application locally

Update the `dev` task in the `deno.json` file in the root, to allow network
access:

```json
"dev": "deno run -N --watch main.ts"
```

Then run the dev command:

```sh
deno run dev
```

Visit `http://localhost:8000` to see your application running. Try navigating to
the different routes (`/about`, `/api/status`, and `/api/error`) to verify
everything works. You'll notice that each request is logged to the console -
these are the same logs you'll be able to see when the app is deployed!

### Authentication

The `deno deploy` command handles authentication automatically. When you first
run a deploy command, it will prompt you to authenticate. Run the deploy command
with the `--help` flag to see all available options:

:::note Deno Deploy organization requirement

The `deno deploy` command requires a Deno Deploy organization. If you don't
already have an organization set up in your account, you can create one through
the [Deno Deploy web app](https://console.deno.com).

### Deploy your application

Now let's use the `deno deploy` command to deploy your application! Ensure that
you are in the root directory of your project and run:

```bash
deno deploy
```

Select the appropriate options in the terminal when prompted.

The deployment process will:

1. Make a tarball of your application code
2. Upload the tarball to Deno Deploy
3. Unpack the tarball
4. Build and deploy to the edge network
5. Provide you with a live URL

You have now successfully deployed your application! You can visit the returned
URL to see your app in action.

If you need to make changes to your application, simply update your code and run
the `deno deploy` command again.

### Monitoring your application

#### View application logs

After deploying your application, you can stream live logs to see exactly what's
happening on the app:

```bash
deno deploy logs
```

### Managing environment variables

Your application might need environment variables for configuration. The
`deno deploy` command provides comprehensive environment variable management.

## How to deploy Deno to Digital Ocean

> A step-by-step guide to deploying Deno applications on Digital Ocean. Learn about Docker containerization, GitHub Actions automation, container registries, and how to set up continuous deployment workflows.

- [`docker` CLI](https://docs.docker.com/engine/reference/commandline/cli/)
- a [GitHub account](https://github.com)
- a [Digital Ocean account](https://digitalocean.com)
- [`doctl` CLI](https://docs.digitalocean.com/reference/doctl/how-to/install/)

### Create Dockerfile and docker-compose.yml

To focus on the deployment, our app will simply be a `main.ts` file that returns
a string as an HTTP response:

```ts title="main.ts"
import { Application } from "jsr:@oak/oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello from Deno and Digital Ocean!";
});

await app.listen({ port: 8000 });
```

Then, we'll create two files -- `Dockerfile` and `docker-compose.yml` -- to
build the Docker image.

In our `Dockerfile`, let's add:

```Dockerfile title="Dockerfile"
FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD . /app

RUN deno install --entrypoint main.ts

CMD ["run", "--allow-net", "main.ts"]
```

Then, in our `docker-compose.yml`:

```yml
version: "3"

services:
  web:
    build: .
    container_name: deno-container
    image: deno-image
    ports:
      - "8000:8000"
```

Let's test this locally by running `docker compose -f docker-compose.yml build`,
then `docker compose up`, and going to `localhost:8000`.

### Build, Tag, and Push your Docker image to Digital Ocean Container Registry

Digital Ocean has its own private Container Registry, with which we can push and
pull Docker images. In order to use this registry, let's
[install and authenticate `doctl` on the command line](https://docs.digitalocean.com/reference/doctl/how-to/install/).

After that, we'll create a new private registry named `deno-on-digital-ocean`:

```shell
doctl registry create deno-on-digital-ocean
```

Using our Dockerfile and docker-compose.yml, we'll build a new image, tag it,
and push it to the registry. Note that `docker-compose.yml` will name the build
locally as `deno-image`.

```shell
docker compose -f docker-compose.yml build
```

Let's [tag](https://docs.docker.com/engine/reference/commandline/tag/) it with
`new`:

```shell
docker tag deno-image registry.digitalocean.com/deno-on-digital-ocean/deno-image:new
```

Before pushing, authenticate your Docker client with Digital Ocean Container
Registry:

```shell
doctl registry login
```

Now we can push it to the registry.

```shell
docker push registry.digitalocean.com/deno-on-digital-ocean/deno-image:new
```

You should see your new `deno-image` with the `new` tag in your
[Digital Ocean container registry](https://cloud.digitalocean.com/registry):

![New deno image on Digital Ocean container registry](./images/how-to/digital-ocean/new-deno-image-on-digital-ocean-container-registry.png)

### Deploy to Digital Ocean via SSH

Once our `deno-image` is in the registry, we can run it anywhere using
`docker run`. In this case, we'll run it while in our
[Digital Ocean Droplet](https://www.digitalocean.com/products/droplets), their
hosted virtual machine.

While on your [Droplet page](https://cloud.digitalocean.com/droplets), click on
your Droplet and then `console` to SSH into the virtual machine. (Or you can
[ssh directly from your command line](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/).)

To pull down the `deno-image` image and run it, let's run:

```shell
docker run -d --restart always -it -p 8000:8000 --name deno-image registry.digitalocean.com/deno-on-digital-ocean/deno-image:new
```

### Automate the Deployment via GitHub Actions

Let's automate that entire process with GitHub actions.

First, let's get all of our environmental variables needed for logging into
`doctl` and SSHing into the Droplet:

- [DIGITALOCEAN_ACCESS_TOKEN](https://docs.digitalocean.com/reference/api/create-personal-access-token/)
- DIGITALOCEAN_HOST (the IP address of your Droplet)
- DIGITALOCEAN_USERNAME (the default is `root`)
- DIGITALOCEAN_SSHKEY (more on this below)

#### Generate `DIGITALOCEAN_SSHKEY`

To do this, first let's run `ssh-keygen` on your local machine:

Using `ssh-copy-id`:

To test whether this is done successfully:

```shell
ssh -i ~/.ssh/mykey {{ username }}@{{ host }}
```

#### Define the yml File

```yml
name: Deploy to Digital Ocean

on:
  push:
    branches:
      - main

env:
  REGISTRY: "registry.digitalocean.com/deno-on-digital-ocean"
  IMAGE_NAME: "deno-image"

jobs:
  build_and_push:
    name: Build, Push, and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main
        uses: actions/checkout@v4

      - name: Set $TAG from shortened sha
        run: echo "TAG=`echo ${GITHUB_SHA} | cut -c1-8`" >> $GITHUB_ENV

      - name: Build container image
        run: docker compose -f docker-compose.yml build

      - name: Tag container image
        run: docker tag ${{ env.IMAGE_NAME }} ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ env.TAG }}

      - name: Install `doctl`
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      - name: Log in to Digital Ocean Container Registry
        run: doctl registry login --expiry-seconds 600

      - name: Push image to Digital Ocean Container Registry
        run: docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ env.TAG }}

      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DIGITALOCEAN_HOST }}
          username: ${{ secrets.DIGITALOCEAN_USERNAME }}
          key: ${{ secrets.DIGITALOCEAN_SSHKEY }}
          script: |
            # Login to Digital Ocean Container Registry
            docker login -u ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }} -p ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }} registry.digitalocean.com
            # Stop and remove a running image.
            docker stop ${{ env.IMAGE_NAME }}
            docker rm ${{ env.IMAGE_NAME }}
            # Run a new container from a new image
            docker run -d --restart always -it -p 8000:8000 --name ${{ env.IMAGE_NAME }} ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ env.TAG }}
```

## How to deploy to Google Cloud Run

> Step-by-step guide to deploying Deno applications on Google Cloud Run. Learn about Docker containerization, Artifact Registry configuration, GitHub Actions automation, and how to set up continuous deployment to Google Cloud.

[Google Cloud Run](https://cloud.google.com/run) is a managed compute platform
that lets you run containers on Google's scalable infrastructure.

Pre-requisites:

- [Google Cloud Platform account](https://cloud.google.com/gcp)
- [`docker` CLI](https://docs.docker.com/engine/reference/commandline/cli/)
  installed
- [`gcloud`](https://cloud.google.com/sdk/gcloud) installed

### Manual Deployment

#### Create `Dockerfile` and `docker-compose.yml`

In our `Dockerfile`, let's add:

#### Set up Artifact Registry

Artifact Registry is GCP's private registry of Docker images.

#### Build, Tag, and Push to Artifact Registry

Once we've created a repository, we can start pushing images to it.

First, let's add the registry's address to `gcloud`:

```shell
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Then, let's build your Docker image. (Note that the image name is defined in our
`docker-compose.yml` file.)

```shell
docker compose -f docker-compose.yml build
```

Then, [tag](https://docs.docker.com/engine/reference/commandline/tag/) it with
the new Google Artifact Registry address, repository, and name. The image name
should follow this structure:
`{{ location }}-docker.pkg.dev/{{ google_cloudrun_project_name }}/{{ repository }}/{{ image }}`.

```shell
docker tag deno-image us-central1-docker.pkg.dev/deno-app-368305/deno-repository/deno-cloudrun-image
```

Next, push the image:

#### Deploy with `gcloud`

Now that it's created, we'll be able to deploy to this service from the `gcloud`
CLI. The command follows this structure:
`gcloud run deploy {{ service_name }} --image={{ image }} --region={{ region }} --allow-unauthenticated`.
Note that the `image` name follows the structure from above.

For this example, the command is:

```shell
gcloud run deploy hello-from-deno --image=us-central1-docker.pkg.dev/deno-app-368305/deno-repository/deno-cloudrun-image --region=us-central1 --allow-unauthenticated
```

### Automate Deployment with GitHub Actions

Now that we have done that, we can automate it with a GitHub workflow. Here's
the yaml file:

```yml
name: Build and Deploy to Cloud Run

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: { { PROJECT_ID } }
  GAR_LOCATION: { { GAR_LOCATION } }
  REPOSITORY: { { GAR_REPOSITORY } }
  SERVICE: { { SERVICE } }
  REGION: { { REGION } }

jobs:
  deploy:
    name: Deploy
    permissions:
      contents: "read"
      id-token: "write"

    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Google Auth
        id: auth
        uses: "google-github-actions/auth@v0"
        with:
          credentials_json: "${{ secrets.GCP_CREDENTIALS }}"

      - name: Login to GAR
        uses: docker/login-action@v2.1.0
        with:
          registry: ${{ env.GAR_LOCATION }}-docker.pkg.dev
          username: _json_key
          password: ${{ secrets.GCP_CREDENTIALS }}

      - name: Build and Push Container
        run: |-
          docker build -t "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE }}:${{ github.sha }}" ./
          docker push "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE }}:${{ github.sha }}"

      - name: Deploy to Cloud Run
        id: deploy
        uses: google-github-actions/deploy-cloudrun@v0
        with:
          service: ${{ env.SERVICE }}
          region: ${{ env.REGION }}
          image: ${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE }}:${{ github.sha }}

      - name: Show Output
        run: echo ${{ steps.deploy.outputs.url }}
```

The environment variables that we need to set are (the examples in parenthesis
are the ones for this repository)

- `PROJECT_ID`: your project id (`deno-app-368305`)
- `GAR_LOCATION`: the location your Google Artifact Registry is set
  (`us-central1`)
- `GAR_REPOSITORY`: the name you gave your Google Artifact Registry
  (`deno-repository`)
- `SERVICE`: the name of the Google Cloud Run service (`hello-from-deno`)
- `REGION`: the region of your Google Cloud Run service (`us-central1`)

The secret variables that we need to set are:

- `GCP_CREDENTIALS`: this is the
  [service account](https://cloud.google.com/iam/docs/service-accounts) json
  key. When you create the service account, be sure to
  [include the roles and permissions necessary](https://cloud.google.com/iam/docs/granting-changing-revoking-access#granting_access_to_a_user_for_a_service_account)
  for Artifact Registry and Google Cloud Run.

## Deploy Deno to AWS Lambda

URL: https://docs.deno.com/examples/deploy_deno_to_aws_lambda/

### Transcript and code

#### Run Deno on AWS Lambda

Running Deno on AWS Lambda? Sure, you can do that. With AWS lambda the
serverless pricing can be cheaper than a VPS and can be easier to maintain
because it can auto scale behind the scenes.

Let’s take a look at the Dockerfile that we can use to make this work:

```dockerfile
## Set up the base image
FROM public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 AS aws-lambda-adapter
FROM denoland/deno:bin-2.0.2 AS deno_bin
FROM debian:bookworm-20230703-slim AS deno_runtime
COPY --from=aws-lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=deno_bin /deno /usr/local/bin/deno
ENV PORT=8000
EXPOSE 8000
RUN mkdir /var/deno_dir
ENV DENO_DIR=/var/deno_dir

## Copy the function code
WORKDIR "/var/task"
COPY . /var/task

## Warmup caches
RUN timeout 10s deno -A main.ts || [ $? -eq 124 ] || exit 1

CMD ["deno", "-A", "main.ts"]
```

```shell
docker build -t my-deno-project .
```

#### Use the CLI to create an ECR

The ECR is a registry service where we can push our docker container

Tag the image

```shell
docker tag my-deno-project:latest <myProject>.dkr.ecr.us-east-1.amazonaws.com/my-deno-project:latest
```

Then Push the image to ECR

```shell
docker push <myproject>.dkr.ecr.us-west-1.amazonaws.com/my-deno-project:latest
```

Now we need to create a function that will host our app:

- [https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1\#/begin](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/begin)
- Think of a function as being a place where the app is going to run
- Select Create a Function
- Select Container Image Radio Button
- Call the function `tree-app`
- Select the app from the Browse Containers button
- Halfway down the page select “Configuration”
- Select `Function URL`
- Create a URL
- Select None so the endpoint is public
- Select Save
- Check the app in the browser

## Deploying Deno with Docker

URL: https://docs.deno.com/examples/deploying_deno_with_docker/

### Transcript and code

Deno has made a lot of things seem easy: linting, formatting, interoperability
with the Node ecosystem, testing, TypeScript, but how about deployment? How easy
is it to get Deno running in production? Pretty easy!

Let’s start with a look at our app. It’s an app that provides us with some
information about trees. On the homepage we get some text At the trees route, we
get some JSON At the dynamic route based on the tree’s id, we get information
about that single tree.

```ts
import { Hono } from "jsr:@hono/hono";

const app = new Hono();

interface Tree {
  id: string;
  species: string;
  age: number;
  location: string;
}

const oak: Tree = {
  id: "1",
  species: "oak",
  age: 3,
  location: "Jim's Park",
};

const maple: Tree = {
  id: "2",
  species: "maple",
  age: 5,
  location: "Betty's Garden",
};

const trees: Tree[] = [oak, maple];

app.get("/", (c) => {
  return c.text("🌲 🌳 The Trees Welcome You! 🌲 🌳");
});

app.get("/trees", (c) => {
  return c.json(trees);
});

app.get("/trees/:id", (c) => {
  const id = c.req.param("id");
  const tree = trees.find((tree) => tree.id === id);
  if (!tree) return c.json({ message: "That tree isn't here!" }, 404);
  return c.json(tree);
});

Deno.serve(app.fetch);
```

### Run Locally with Docker

Make sure that Docker is installed on your machine. In your terminal or command
prompt, you can run docker and if you get a big list of commands, you have it.
If not, head over to https://www.docker.com/ and download it based on your
operating system.

#### Test run docker:

Then run the command to get running on `localhost:8000` with Docker

```shell
docker run -it -p 8000:8000 -v $PWD:/my-deno-project denoland/deno:2.0.2 run
--allow-net /my-deno-project/main.ts
```

It’s also possible to run this with a docker config file.

```dockerfile
FROM
denoland/deno:2.0.2

## The port that your application listens to.

EXPOSE 8000

WORKDIR /app

## Prefer not to run as root.
USER deno

## These steps will be re-run upon each file change in your working directory:
COPY . .

## Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

## Warmup caches
RUN timeout 10s deno -A main.ts || [ $? -eq 124 ] || exit 1

CMD ["run", "--allow-net", "main.ts"]
```

Then build it

```shell
docker build -t my-deno-project .
```

### Deploy to fly.io

If you haven’t worked with fly before, it’s a cloud platform that allows you to
deploy and run fullstack apps. They run in multiple regions throughout the world
which makes them a pretty nice option. https://fly.io/

#### Install Fly

Install with curl

```shell
curl -L https://fly.io/install.sh | sh
```

#### Log in with Fly via CLI

```shell
fly auth login
```

This will open the browser for you to log into your account (or create one if
you haven’t already). Then we’ll launch the app with fly using:

```shell
flyctl launch
```

# CLI

## deno deploy

> Manage and publish your projects on the web

The `deno deploy` command provides a command line interface for managing and
deploying applications to [Deno Deploy EA](https://deno.com/deploy), Deno's
platform for hosting JavaScript, TypeScript, and WebAssembly applications.

When called without any subcommands, `deno deploy` will deploy your local
directory to the specified application.

### Authentication

The deploy command uses secure token-based authentication stored in your
system's keyring:

- **Automatic Authentication**: The CLI will prompt for authentication when
  needed
- **Token Storage**: Deploy tokens are securely stored using the system keyring
- **Token Management**: The CLI provides operations to get, set, and delete
  authentication tokens.

### Subcommands

#### Create application

Creates a new application in Deno Deploy. When run without flags, an interactive
wizard walks you through each step. When any configuration flag is provided, the
command runs in non-interactive mode (useful for CI/CD pipelines and scripting).

```bash
deno deploy create [root-path]
```

#### Environment variables management

Manage environment variables for your deployed applications.

```bash
deno deploy env
```

#### Application logs

Stream logs from a deployed application.