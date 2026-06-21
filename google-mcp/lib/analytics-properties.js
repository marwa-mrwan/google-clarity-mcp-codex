import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..");

function decodeBase64Env(value) {
  if (!value) {
    return undefined;
  }

  return Buffer.from(value, "base64").toString("utf8");
}

function readConfiguredFile() {
  const configPath =
    process.env.GOOGLE_ANALYTICS_PROPERTIES_FILE ||
    process.env.MARKETING_ACCOUNTS_FILE;
  if (!configPath) {
    return undefined;
  }

  const resolvedPath = resolveConfigPath(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configured GA4 properties file does not exist: ${resolvedPath}`);
  }

  return fs.readFileSync(resolvedPath, "utf8");
}

function normalizeWebsite(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function normalizeProperty(property) {
  const name = String(property.name || property.project || "").trim();
  const label = String(property.label || name).trim();
  const website = String(property.website || property.site_url || property.url || "").trim();
  const propertyId =
    property.property_id ??
    property.propertyId ??
    property.analytics_property_id ??
    property.analyticsPropertyId ??
    property.analytics_id ??
    null;

  if (!name) {
    throw new Error("Each GA4 property mapping needs a non-empty name.");
  }

  return {
    name,
    label,
    website,
    property_id: propertyId ? String(propertyId).trim() : null,
  };
}

export function loadConfiguredAnalyticsProperties() {
  const raw =
    readConfiguredFile() ||
    process.env.GOOGLE_ANALYTICS_PROPERTIES_JSON ||
    decodeBase64Env(process.env.GOOGLE_ANALYTICS_PROPERTIES_JSON_BASE64);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);
  const properties = Array.isArray(parsed.properties)
    ? parsed.properties
    : Array.isArray(parsed.accounts)
      ? parsed.accounts
      : Array.isArray(parsed.projects)
        ? parsed.projects
        : [];

  return properties.map(normalizeProperty);
}

export function listSafeAnalyticsProperties(properties = loadConfiguredAnalyticsProperties()) {
  return properties.map((property) => ({
    name: property.name,
    label: property.label,
    website: property.website,
    property_id: property.property_id,
    has_property_id: Boolean(property.property_id),
  }));
}

export function resolveAnalyticsProperty(args = {}) {
  if (args.property_id) {
    return String(args.property_id).trim();
  }

  const wantedName = String(args.project_name || args.account_name || "").trim().toLowerCase();
  const wantedWebsite = normalizeWebsite(args.website || args.site_url);

  if (!wantedName && !wantedWebsite) {
    throw new Error("Missing property_id, project_name, or website.");
  }

  const properties = loadConfiguredAnalyticsProperties();
  const selected = properties.find((property) => {
    const names = [property.name, property.label].map((value) => String(value).toLowerCase());
    return (
      (wantedName && names.includes(wantedName)) ||
      (wantedWebsite && normalizeWebsite(property.website) === wantedWebsite)
    );
  });

  if (!selected) {
    throw new Error("Unknown GA4 project. Use ga4_list_configured_properties first.");
  }

  if (!selected.property_id) {
    throw new Error(`Missing GA4 property_id for project "${selected.name}".`);
  }

  return selected.property_id;
}

function resolveConfigPath(configPath) {
  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  const candidates = [
    path.resolve(workspaceRoot, configPath),
    path.resolve(packageRoot, configPath),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}
