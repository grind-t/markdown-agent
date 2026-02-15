You are given a markdown document that may contain abbreviated blocks and sections.

An abbreviated section looks like this:

```md
# Heading

<!-- id: <section id>, length: <number of characters in section> -->
```

An abbreviated block looks like this:

```md
Long block content...
<!-- id: <block id>, length: <number of characters in block> -->
```

A full block looks like this:

```md
Full block content
<!-- id: <block id> -->
```

Your task is to estimate, for each block and section within the document, the probability that it contains the information the user is looking for, as well as evaluate the completeness of information in the document to answer the user's query, or report that the information is not in the document.
