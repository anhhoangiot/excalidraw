#!/usr/bin/env node
// Guard for GHSA-xq3m-2v4x-88gg (CVE-2026-41242): protobufjs RCE, fixed in 7.5.5
// Verifies both the yarn.lock resolution and the installed copy are patched.
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const MIN_PATCHED = "7.5.5";

const parseVersion = (version) => version.split(".").map(Number);
const isPatched = (version) =>
  parseVersion(version) >= parseVersion(MIN_PATCHED) ||
  parseVersion(version)[0] >= 8;

// 1. every protobufjs resolution in yarn.lock must be patched
const lock = fs.readFileSync(path.join(__dirname, "..", "yarn.lock"), "utf8");
const versions = [...lock.matchAll(/^protobufjs@\S.*:$([\s\S]*?)^  version "([^"]+)"/gm)].map(
  (m) => m[2],
);
assert.ok(versions.length > 0, "no protobufjs entries found in yarn.lock");
for (const version of versions) {
  assert.ok(
    isPatched(version),
    `yarn.lock resolves vulnerable protobufjs@${version} (< ${MIN_PATCHED})`,
  );
}

// 2. the installed copy must be patched
const installedPkg = path.join(
  __dirname,
  "..",
  "node_modules",
  "protobufjs",
  "package.json",
);
assert.ok(fs.existsSync(installedPkg), "protobufjs is not installed");
const installed = require(installedPkg).version;
assert.ok(
  isPatched(installed),
  `installed protobufjs@${installed} is vulnerable (< ${MIN_PATCHED})`,
);

console.log(
  `OK: protobufjs patched in yarn.lock (${versions.join(", ")}) and node_modules (${installed})`,
);
