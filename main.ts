import { $ } from "bun";
import OpenAI from "openai";

const apiKey = Bun.env["OPENAI_API_KEY"] ?? "";
if (apiKey === "") {
  throw new Error("OPENAI_API_KEY environment variable is missing");
}

const openai = new OpenAI({ apiKey });

interface Release {
  createdAt: string;
  isDraft: boolean;
  isLatest: boolean;
  isPrerelease: boolean;
  name: string;
  publishedAt: string;
  tagName: string;
}

// gh api repos/gleam-lang/gleam/git/ref/tags/v1.2.0
interface Tag {
  ref: string; // "refs/tags/v1.2.0"
  object: {
    sha: string; // "ea129f7e91b68b0d4cf5b9f081ca5026565232b7"
    type: string; // "commit"
    url: string; // "https://api.github.com/repos/gleam-lang/gleam/git/commits/ea129f7e91b68b0d4cf5b9f081ca5026565232b7"
  };
}

const releases: Release[] =
  await $`gh release ls --json createdAt,isDraft,isLatest,isPrerelease,name,publishedAt,tagName --repo gleam-lang/gleam --limit 1000 --order desc`.json();

for (const release of releases) {
  if (!release.tagName.endsWith("0")) continue;
  if (!release.tagName.startsWith("v1")) break;
  const tag: Tag = await $`gh api repos/gleam-lang/gleam/git/ref/tags/${release.tagName}`.json();
  console.log(tag.ref);
}
