#!/usr/bin/env node

const { execSync } = require("node:child_process");
const { statSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_LIMIT_BYTES = 300 * 1024 * 1024;
const FILE_LIMIT_BYTES = 25 * 1024 * 1024;
const ALLOWED_LARGE_PREFIX = "public/resources/";

function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getCandidateFiles() {
  const output = execSync("git ls-files -z --cached --others --exclude-standard", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return output
    .split("\0")
    .map((file) => file.trim())
    .filter(Boolean);
}

function main() {
  const repoRoot = process.cwd();
  const files = getCandidateFiles();

  let totalBytes = 0;
  const largeOffenders = [];

  for (const relativePath of files) {
    let size = 0;
    try {
      const stats = statSync(resolve(repoRoot, relativePath));
      if (!stats.isFile()) continue;
      size = stats.size;
    } catch {
      continue;
    }

    totalBytes += size;

    if (size > FILE_LIMIT_BYTES && !relativePath.startsWith(ALLOWED_LARGE_PREFIX)) {
      largeOffenders.push({ path: relativePath, size });
    }
  }

  if (totalBytes > REPO_LIMIT_BYTES) {
    console.error(
      `Repository payload too large: ${formatMB(totalBytes)} (limit ${formatMB(REPO_LIMIT_BYTES)}).`
    );
    process.exit(1);
  }

  if (largeOffenders.length > 0) {
    console.error("Files above 25MB outside public/resources:");
    for (const offender of largeOffenders) {
      console.error(`- ${offender.path}: ${formatMB(offender.size)}`);
    }
    process.exit(1);
  }

  console.log(
    `Size check passed. Payload=${formatMB(totalBytes)}; no oversized files outside ${ALLOWED_LARGE_PREFIX}`
  );
}

main();
