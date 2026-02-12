import type { Heading, RootContent } from "mdast";

export type Section = {
  id: number;
  heading: Heading;
  content: RootContent[];
};
