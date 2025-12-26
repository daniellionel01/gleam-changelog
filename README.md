# Gleam Changelog

For no particular reason I broke down the changelogs by category (Bug Fix, Compiler, ...) for every release and visualised them.

Disclaimer: this is totally arbitrary and does not consider the effort put into each changelog entry.

Nevertheless I think it's fun to look at. The team is definitely not slowing down!

## How to run

Software required to run this script:
- Bun JS (https://bun.sh/)
- GitHub CLI (https://cli.github.com/)

Environment Variables required:
- OPENAI_API_KEY

```sh
$ bun install
$ bun run main.ts
```

## GPT Prompt for Visualisation
```md
Visualise the changelog item amounts for each category for each release as two charts
- A stacked bar chart with each release broken down by the category (oldest to latest from left to right)
- A line chart with an accumulated line for each category (oldest to latest from left to right)

Make sure you order the releases correctly. Do not order them alphabetically since 1.13 will come before 1.3.

Here are the colors for each category:
- Compiler: green
- Formatter: orange
- Bug fixes: light blue
- Build tool: yellow
- Language server: darker blue
```

## Data so far

```json
{
  release: "v1.14.0",
  compiler: 15,
  formatter: 27,
  bug_fixes: 4,
  build_tool: 7,
  language_server: 11,
}
{
  release: "v1.13.0",
  compiler: 16,
  formatter: 4,
  bug_fixes: 32,
  build_tool: 7,
  language_server: 16,
}
{
  release: "v1.12.0",
  compiler: 18,
  formatter: 5,
  bug_fixes: 23,
  build_tool: 7,
  language_server: 4,
}
{
  release: "v1.11.0",
  compiler: 16,
  formatter: 1,
  bug_fixes: 37,
  build_tool: 9,
  language_server: 9,
}
{
  release: "v1.10.0",
  compiler: 13,
  formatter: 0,
  bug_fixes: 17,
  build_tool: 6,
  language_server: 12,
}
{
  release: "v1.9.0",
  compiler: 6,
  formatter: 1,
  bug_fixes: 8,
  build_tool: 5,
  language_server: 8,
}
{
  release: "v1.8.0",
  compiler: 7,
  formatter: 0,
  bug_fixes: 7,
  build_tool: 4,
  language_server: 7,
}
{
  release: "v1.7.0",
  compiler: 12,
  formatter: 4,
  bug_fixes: 20,
  build_tool: 8,
  language_server: 8,
}
{
  release: "v1.6.0",
  compiler: 8,
  formatter: 1,
  bug_fixes: 28,
  build_tool: 6,
  language_server: 4,
}
{
  release: "v1.5.0",
  compiler: 15,
  formatter: 1,
  bug_fixes: 18,
  build_tool: 8,
  language_server: 4,
}
{
  release: "v1.4.0",
  compiler: 19,
  formatter: 3,
  bug_fixes: 0,
  build_tool: 2,
  language_server: 11,
}
{
  release: "v1.3.0",
  compiler: 12,
  formatter: 2,
  bug_fixes: 10,
  build_tool: 2,
  language_server: 6,
}
{
  release: "v1.2.0",
  compiler: 14,
  formatter: 10,
  bug_fixes: 23,
  build_tool: 6,
  language_server: 12,
}
{
  release: "v1.1.0",
  compiler: 32,
  formatter: 15,
  bug_fixes: 0,
  build_tool: 27,
  language_server: 5,
}
{
  release: "v1.0.0",
  compiler: 2,
  formatter: 2,
  bug_fixes: 5,
  build_tool: 3,
  language_server: 1,
}
```
