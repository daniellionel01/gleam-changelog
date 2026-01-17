import { $ } from "bun";

interface Release {
  createdAt: string;
  isDraft: boolean;
  isLatest: boolean;
  isPrerelease: boolean;
  name: string;
  publishedAt: string;
  tagName: string;
}

interface ChangelogCounts {
  release: string;
  compiler: number;
  formatter: number;
  bug_fixes: number;
  build_tool: number;
  language_server: number;
}

function categorizeBugFix(text: string): string {
  const lower = text.toLowerCase();

  if (/language server|code action|completions?|completion|hover|diagnostic/.test(lower)) {
    return "language_server";
  }
  if (/build tool|gleam (run|add|new|deps|update)|hex (?=api|repo)|dependencies?|manifest\.toml/.test(lower)) {
    return "build_tool";
  }
  if (/formatter|formatting|indentation|trailing/.test(lower)) {
    return "formatter";
  }
  return "compiler";
}

function parseChangelog(changelog: string, targetBaseVersion: string): {
  sections: Record<string, number>;
  bugFixAttribution: Record<string, number>;
} {
  const sections: Record<string, number> = {
    compiler: 0,
    formatter: 0,
    bug_fixes: 0,
    build_tool: 0,
    language_server: 0,
  };

  const bugFixAttribution: Record<string, number> = {
    compiler: 0,
    formatter: 0,
    build_tool: 0,
    language_server: 0,
  };

  const categoryToSection: Record<string, string> = {
    compiler: "compiler",
    formatter: "formatter",
    bug_fixes: "bug_fixes",
    build_tool: "build_tool",
    language_server: "language_server",
  };

  const categoryPatterns: Record<string, RegExp> = {
    compiler: /^###\s+Compiler$/i,
    formatter: /^###\s+Formatter$/i,
    bug_fixes: /^###\s+Bug fixes$/i,
    build_tool: /^###\s+Build( tool)?( changes)?$/i,
    language_server: /^###\s+Language[ ]Server( changes)?$/i,
  };

  const lines = changelog.split('\n');
  let currentSection: string | null = null;
  let inTargetVersion = false;
  let currentBugFixEntry: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    const versionMatch = trimmedLine.match(/^## v?(\d+\.\d+)/);
    if (versionMatch) {
      const fileBaseVersion = versionMatch[1];
      inTargetVersion = fileBaseVersion === targetBaseVersion;
      currentSection = null;
      currentBugFixEntry = [];
      continue;
    }

    if (!inTargetVersion) continue;

    let matchedCategory: string | null = null;
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(trimmedLine)) {
        matchedCategory = category;
        break;
      }
    }

    if (matchedCategory) {
      if (currentSection === "bug_fixes" && currentBugFixEntry.length > 0) {
        const attribution = categorizeBugFix(currentBugFixEntry.join(" "));
        bugFixAttribution[attribution] = (bugFixAttribution[attribution] ?? 0) + 1;
        currentBugFixEntry = [];
      }
      currentSection = categoryToSection[matchedCategory] ?? null;
      continue;
    }

    if (currentSection === "bug_fixes") {
      if (trimmedLine.startsWith('- ')) {
        if (currentBugFixEntry.length > 0) {
          const attribution = categorizeBugFix(currentBugFixEntry.join(" "));
          bugFixAttribution[attribution] = (bugFixAttribution[attribution] ?? 0) + 1;
          currentBugFixEntry = [];
        }
        sections.bug_fixes = (sections.bug_fixes ?? 0) + 1;
        currentBugFixEntry.push(trimmedLine);
      } else if (currentBugFixEntry.length > 0 && (trimmedLine === "" || trimmedLine.startsWith('  '))) {
        currentBugFixEntry.push(trimmedLine);
      } else if (currentBugFixEntry.length > 0) {
        const attribution = categorizeBugFix(currentBugFixEntry.join(" "));
        bugFixAttribution[attribution] = (bugFixAttribution[attribution] ?? 0) + 1;
        currentBugFixEntry = [];
      }
    } else if (currentSection && trimmedLine.startsWith('- ')) {
      sections[currentSection] = (sections[currentSection] ?? 0) + 1;
    }
  }

  if (currentSection === "bug_fixes" && currentBugFixEntry.length > 0) {
    const attribution = categorizeBugFix(currentBugFixEntry.join(" "));
    bugFixAttribution[attribution] = (bugFixAttribution[attribution] ?? 0) + 1;
  }

  return { sections, bugFixAttribution };
}

function versionSortKey(version: string): number[] {
  return version.split('.').map(n => parseInt(n, 10));
}

async function main() {
  const releases: Release[] =
    await $`gh release ls --json createdAt,isDraft,isLatest,isPrerelease,name,publishedAt,tagName --repo gleam-lang/gleam --limit 1000 --order desc`.json();

  const versions = new Set<string>();
  for (const release of releases) {
    const versionMatch = release.name.match(/^v(\d+\.\d+)/);
    if (versionMatch && versionMatch[1]) {
      versions.add(versionMatch[1]);
    }
  }

  const sortedVersions = Array.from(versions).sort((a, b) => {
    const aParts = versionSortKey(a);
    const bParts = versionSortKey(b);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;
      if (aVal !== bVal) return bVal - aVal;
    }
    return 0;
  });

  const results: ChangelogCounts[] = [];
  const attributedResults: ChangelogCounts[] = [];

  for (const baseVersion of sortedVersions) {
    const changelogUrl = `https://raw.githubusercontent.com/gleam-lang/gleam/main/changelog/v${baseVersion}.md`;
    const changelogRes = await fetch(changelogUrl);

    if (!changelogRes.ok) {
      continue;
    }

    const changelog = await changelogRes.text();
    if (changelog === "") {
      continue;
    }

    const { sections, bugFixAttribution } = parseChangelog(changelog, baseVersion);

    const result: ChangelogCounts = {
      release: `v${baseVersion}.0`,
      compiler: sections.compiler ?? 0,
      formatter: sections.formatter ?? 0,
      bug_fixes: sections.bug_fixes ?? 0,
      build_tool: sections.build_tool ?? 0,
      language_server: sections.language_server ?? 0,
    };

    const attributedResult: ChangelogCounts = {
      release: `v${baseVersion}.0`,
      compiler: (sections.compiler ?? 0) + (bugFixAttribution.compiler ?? 0),
      formatter: (sections.formatter ?? 0) + (bugFixAttribution.formatter ?? 0),
      bug_fixes: 0,
      build_tool: (sections.build_tool ?? 0) + (bugFixAttribution.build_tool ?? 0),
      language_server: (sections.language_server ?? 0) + (bugFixAttribution.language_server ?? 0),
    };

    results.push(result);
    attributedResults.push(attributedResult);
  }

  console.log("=== STANDARD (non-attributed) ===");
  for (const result of results) {
    console.log(JSON.stringify(result, null, 2));
  }

  console.log("\n=== ATTRIBUTED (bug fixes distributed) ===");
  for (const result of attributedResults) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
