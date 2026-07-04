#!/usr/bin/env node
import fs from "node:fs/promises";

const file = process.argv[2];
if (!file) {
  throw new Error("Usage: node summarize-payload.mjs <payload.json>");
}

const payload = JSON.parse(await fs.readFile(file, "utf8"));
const tabs = payload.tabs || {};

const expected = [
  "Dashboard",
  "Fix Playbook",
  "Cannibalization Decisions",
  "Service Page Needs",
  "Service Internal Links",
  "Article Internal Link",
  "Schema Fixes",
  "Issue - Titles",
  "Issue - Meta",
  "Issue - H1",
  "Issue - Thin Pages",
  "Issue - Image",
  "Issue - Redirects",
  "Issue - Links in Sitemap",
  "Issue - Robots.txt",
  "Pages Audit",
];

const normalize = (value) => String(value || "").trim();
const tabNames = Object.keys(tabs);
const rows = tabNames.map((name) => {
  const values = tabs[name] || [];
  const headers = (values[0] || []).map(normalize);
  return {
    tab: name,
    rows: Math.max(values.length - 1, 0),
    columns: headers.length,
    hasChecklist: headers.includes("Checklist"),
    hasFinalUrl: headers.includes("Final URL"),
  };
});

const missingExpected = expected.filter(
  (name) => !tabNames.some((tab) => normalize(tab) === name)
);
const finalUrlOutsideRedirects = rows.filter(
  (row) => row.hasFinalUrl && !/redirect/i.test(row.tab)
);
const actionableWithoutChecklist = rows.filter((row) => {
  if (row.tab === "Dashboard" || row.tab === "Fix Playbook") return false;
  return row.rows > 0 && !row.hasChecklist;
});

console.log(
  JSON.stringify(
    {
      title: payload.title || "",
      tabCount: tabNames.length,
      tabs: rows,
      missingExpected,
      actionableWithoutChecklist,
      finalUrlOutsideRedirects,
    },
    null,
    2
  )
);
