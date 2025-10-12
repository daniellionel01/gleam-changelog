import { $ } from "bun";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import z from "zod/v3";

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

const changelogSchema = z.object({
  release: z.string(),
  compiler: z.number(),
  formatter: z.number(),
  bug_fixes: z.number(),
  build_tool: z.number(),
  language_server: z.number(),
});

const releases: Release[] =
  await $`gh release ls --json createdAt,isDraft,isLatest,isPrerelease,name,publishedAt,tagName --repo gleam-lang/gleam --limit 1000 --order desc`.json();

for (const release of releases) {
  if (!release.tagName.endsWith("0")) continue;
  if (!release.tagName.startsWith("v1")) break;

  // let's not get ratelimited by github
  await Bun.sleep(500);

  // v1.1.0 -> v1.1
  const version = release.name.slice(0, -2);
  const res = await fetch(`https://raw.githubusercontent.com/gleam-lang/gleam/refs/heads/main/changelog/${version}.md`);
  const changelog = await res.text();

  const parsedChangelog = await openai.chat.completions.parse({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `Structure the changelog for the following version: ${release.name}. This includes RCs and patches but not previous versions.`,
      },
      { role: "user", content: changelog },
    ],
    response_format: zodResponseFormat(changelogSchema, "changelog"),
  });
  const responseChangelog = parsedChangelog.choices[0]?.message.parsed;
  if (responseChangelog === null || responseChangelog === undefined) {
    throw new Error(`Could not parse changelog for ${release.name}`);
  }

  const parsedFlattened = await openai.chat.completions.parse({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `Structure the changelog for the following version: ${release.name}. This includes RCs and patches but not previous versions. Attribute the section for bugfixes to the other sections so we know what has been worked on with more detail, so that bug_fixes is 0 in your output.`,
      },
      { role: "user", content: changelog },
    ],
    response_format: zodResponseFormat(changelogSchema, "changelog"),
  });
  const responseFlattened = parsedFlattened.choices[0]?.message.parsed;
  if (responseFlattened === null || responseFlattened === undefined) {
    throw new Error(`Could not parse flattened changelog for ${release.name}`);
  }

  console.log(responseFlattened);
}
