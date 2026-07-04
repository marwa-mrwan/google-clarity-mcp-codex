import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const analyticsFile = args.analytics;
const envFile = args.env;
const outputFile = args.output || path.join(rootDir, ".vscode", "marketing.accounts.local.json");

if (!analyticsFile) {
  throw new Error("Missing --analytics path/to/legacy-ga4-properties.json");
}

const analyticsAccounts = readAnalyticsAccounts(analyticsFile);
const clarityProjects = envFile ? readClarityProjects(envFile) : [];
const accounts = mergeAccounts(analyticsAccounts, clarityProjects);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({ accounts }, null, 2)}\n`);

const withClarity = accounts.filter((account) => account.clarity_token).length;
console.log(`Wrote ${path.relative(rootDir, outputFile)}`);
console.log(`Accounts: ${accounts.length}`);
console.log(`Accounts with Clarity token: ${withClarity}`);

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--analytics") {
      parsed.analytics = values[++index];
    } else if (value === "--env") {
      parsed.env = values[++index];
    } else if (value === "--output") {
      parsed.output = values[++index];
    }
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readAnalyticsAccounts(filePath) {
  const parsed = readJson(filePath);
  const rows = Array.isArray(parsed.accounts)
    ? parsed.accounts
    : Array.isArray(parsed.properties)
      ? parsed.properties
      : Array.isArray(parsed.projects)
        ? parsed.projects
        : [];

  return rows.map((row) => ({
    name: clean(row.name || row.project || row.label),
    label: clean(row.label || row.name || row.project),
    website: clean(row.website || row.site_url || row.url),
    analytics_property_id: clean(
      row.analytics_property_id || row.property_id || row.propertyId || row.analytics_id
    ),
  }));
}

function readClarityProjects(filePath) {
  const env = parseEnv(fs.readFileSync(filePath, "utf8"));
  const raw =
    env.CLARITY_PROJECTS_JSON ||
    decodeBase64(env.CLARITY_PROJECTS_JSON_BASE64) ||
    readOptionalJsonFromEnvFile(env.CLARITY_PROJECTS_FILE, filePath);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);
  const rows = Array.isArray(parsed.accounts)
    ? parsed.accounts
    : Array.isArray(parsed.projects)
      ? parsed.projects
      : Array.isArray(parsed.properties)
        ? parsed.properties
        : [];

  return rows.map((row) => ({
    name: clean(row.name || row.project || row.label),
    label: clean(row.label || row.name || row.project),
    website: clean(row.website || row.site_url || row.url),
    clarity_token: clean(row.clarity_token || row.token || row.api_token),
  }));
}

function parseEnv(raw) {
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

function readOptionalJsonFromEnvFile(configPath, envFile) {
  if (!configPath) {
    return undefined;
  }

  const resolvedPath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(path.dirname(envFile), configPath);

  return fs.existsSync(resolvedPath) ? fs.readFileSync(resolvedPath, "utf8") : undefined;
}

function decodeBase64(value) {
  return value ? Buffer.from(value, "base64").toString("utf8") : undefined;
}

function mergeAccounts(analyticsAccounts, clarityProjects) {
  return analyticsAccounts.map((account) => {
    const clarityProject = findMatchingClarityProject(account, clarityProjects);
    return {
      ...account,
      clarity_token: clarityProject?.clarity_token || "",
    };
  });
}

function findMatchingClarityProject(account, clarityProjects) {
  const accountNames = [account.name, account.label].map(normalizeName).filter(Boolean);
  const accountWebsite = normalizeWebsite(account.website);

  return clarityProjects.find((project) => {
    const projectNames = [project.name, project.label].map(normalizeName).filter(Boolean);
    return (
      projectNames.some((name) => accountNames.includes(name)) ||
      (accountWebsite && normalizeWebsite(project.website) === accountWebsite)
    );
  });
}

function clean(value) {
  return String(value || "").trim();
}

function normalizeName(value) {
  return clean(value).toLowerCase();
}

function normalizeWebsite(value) {
  return clean(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}
