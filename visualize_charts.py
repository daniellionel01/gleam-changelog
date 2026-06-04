import re

import matplotlib.pyplot as plt
import pandas as pd

data = [
    {
        "release": "v1.17.0",
        "compiler": 8,
        "formatter": 0,
        "bug_fixes": 8,
        "build_tool": 39,
        "language_server": 13,
    },
    {
        "release": "v1.16.0",
        "compiler": 9,
        "formatter": 2,
        "bug_fixes": 19,
        "build_tool": 17,
        "language_server": 8,
    },
    {
        "release": "v1.15.0",
        "compiler": 7,
        "formatter": 1,
        "bug_fixes": 32,
        "build_tool": 9,
        "language_server": 19,
    },
    {
        "release": "v1.14.0",
        "compiler": 15,
        "formatter": 0,
        "bug_fixes": 31,
        "build_tool": 7,
        "language_server": 11,
    },
    {
        "release": "v1.13.0",
        "compiler": 17,
        "formatter": 4,
        "bug_fixes": 32,
        "build_tool": 7,
        "language_server": 16,
    },
    {
        "release": "v1.12.0",
        "compiler": 19,
        "formatter": 5,
        "bug_fixes": 23,
        "build_tool": 15,
        "language_server": 4,
    },
    {
        "release": "v1.11.0",
        "compiler": 16,
        "formatter": 2,
        "bug_fixes": 37,
        "build_tool": 9,
        "language_server": 9,
    },
    {
        "release": "v1.10.0",
        "compiler": 13,
        "formatter": 1,
        "bug_fixes": 17,
        "build_tool": 8,
        "language_server": 12,
    },
    {
        "release": "v1.9.0",
        "compiler": 6,
        "formatter": 1,
        "bug_fixes": 8,
        "build_tool": 5,
        "language_server": 8,
    },
    {
        "release": "v1.8.0",
        "compiler": 7,
        "formatter": 0,
        "bug_fixes": 7,
        "build_tool": 4,
        "language_server": 7,
    },
    {
        "release": "v1.7.0",
        "compiler": 12,
        "formatter": 5,
        "bug_fixes": 20,
        "build_tool": 8,
        "language_server": 8,
    },
    {
        "release": "v1.6.0",
        "compiler": 8,
        "formatter": 1,
        "bug_fixes": 28,
        "build_tool": 6,
        "language_server": 4,
    },
    {
        "release": "v1.5.0",
        "compiler": 17,
        "formatter": 1,
        "bug_fixes": 18,
        "build_tool": 8,
        "language_server": 4,
    },
    {
        "release": "v1.4.0",
        "compiler": 13,
        "formatter": 1,
        "bug_fixes": 9,
        "build_tool": 2,
        "language_server": 10,
    },
    {
        "release": "v1.3.0",
        "compiler": 14,
        "formatter": 1,
        "bug_fixes": 8,
        "build_tool": 2,
        "language_server": 6,
    },
    {
        "release": "v1.2.0",
        "compiler": 13,
        "formatter": 5,
        "bug_fixes": 23,
        "build_tool": 12,
        "language_server": 10,
    },
    {
        "release": "v1.1.0",
        "compiler": 32,
        "formatter": 15,
        "bug_fixes": 0,
        "build_tool": 27,
        "language_server": 5,
    },
]


def semver_key(release: str) -> tuple[int, int, int]:
    """Convert releases like 'v1.13.0' into sortable integer tuples."""
    return tuple(map(int, re.sub(r"^v", "", release).split(".")))


df = pd.DataFrame(data)
df = df.sort_values("release", key=lambda s: s.map(semver_key)).reset_index(drop=True)

categories = {
    "compiler": "Compiler",
    "formatter": "Formatter",
    "bug_fixes": "Bug fixes",
    "build_tool": "Build tool",
    "language_server": "Language server",
}

colors = {
    "compiler": "green",
    "formatter": "orange",
    "bug_fixes": "lightskyblue",
    "build_tool": "yellow",
    "language_server": "royalblue",
}

# Chart 1: stacked bar chart
fig, ax = plt.subplots(figsize=(14, 7))
bottom = pd.Series([0] * len(df))

for key, label in categories.items():
    ax.bar(
        df["release"],
        df[key],
        bottom=bottom,
        label=label,
        color=colors[key],
        edgecolor="black",
        linewidth=0.4,
    )
    bottom += df[key]

ax.set_title("Changelog items per release by category")
ax.set_xlabel("Release")
ax.set_ylabel("Number of changelog items")
ax.legend(title="Category")
ax.tick_params(axis="x", rotation=45)
ax.grid(axis="y", alpha=0.3)
fig.tight_layout()
plt.show()

# Chart 2: cumulative line chart
cumulative_df = df[list(categories.keys())].cumsum()

fig, ax = plt.subplots(figsize=(14, 7))

for key, label in categories.items():
    ax.plot(
        df["release"],
        cumulative_df[key],
        marker="o",
        label=label,
        color=colors[key],
        linewidth=2,
    )

ax.set_title("Accumulated changelog items by category")
ax.set_xlabel("Release")
ax.set_ylabel("Accumulated number of changelog items")
ax.legend(title="Category")
ax.tick_params(axis="x", rotation=45)
ax.grid(alpha=0.3)
fig.tight_layout()
plt.show()

print("Release order used:")
print(", ".join(df["release"]))
