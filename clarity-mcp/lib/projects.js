import fs from "fs";
import path from "path";

export function loadProjects(projectRoot) {
  const configPath = resolveConfigPath(projectRoot);

  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(rawConfig);
    const projects = selectProjectArray(parsed);

    return { configPath, projects: projects.map(normalizeProject) };
  }

  const envProjects = loadProjectsFromEnv();
  if (envProjects) {
    return envProjects;
  }

  if (!fs.existsSync(configPath)) {
    if (process.env.CLARITY_API_TOKEN) {
      return {
        configPath,
        projects: [
          {
            name: process.env.CLARITY_PROJECT_NAME || "default",
            label: process.env.CLARITY_PROJECT_LABEL || "Default Clarity Project",
            token: process.env.CLARITY_API_TOKEN,
          },
        ],
      };
    }

    return { configPath, projects: [] };
  }
}

function loadProjectsFromEnv() {
  const raw =
    process.env.CLARITY_PROJECTS_JSON ||
    decodeBase64Env(process.env.CLARITY_PROJECTS_JSON_BASE64);

  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw);
  const projects = selectProjectArray(parsed);

  return {
    configPath: "CLARITY_PROJECTS_JSON",
    projects: projects.map(normalizeProject),
  };
}

function decodeBase64Env(value) {
  if (!value) {
    return undefined;
  }

  return Buffer.from(value, "base64").toString("utf8");
}

export function listSafeProjects(projects) {
  return projects.map((project) => ({
    name: project.name,
    label: project.label,
    website: project.website,
    analytics_property_id: project.analytics_property_id,
    has_analytics_property_id: Boolean(project.analytics_property_id),
    has_token: Boolean(project.token && !isPlaceholderToken(project.token)),
  }));
}

export function resolveProject(projects, projectName) {
  if (!projects.length) {
    throw new Error(
      "No Clarity projects configured. Add your projects to a local Clarity projects file."
    );
  }

  const selected =
    projectName === undefined || projectName === null || projectName === ""
      ? projects.length === 1
        ? projects[0]
        : null
      : projects.find((project) => {
          const wanted = String(projectName).toLowerCase();
          return (
            project.name.toLowerCase() === wanted ||
            project.label.toLowerCase() === wanted
          );
        });

  if (!selected) {
    throw new Error(
      "Unknown or missing project_name. Use clarity_list_projects to see configured projects."
    );
  }

  if (!selected.token || isPlaceholderToken(selected.token)) {
    throw new Error(`Missing Clarity token for project "${selected.name}".`);
  }

  return selected;
}

function resolveConfigPath(projectRoot) {
  const candidates = [
    normalizeWorkspaceConfigPath(projectRoot, process.env.MARKETING_ACCOUNTS_FILE),
    normalizeConfigPath(projectRoot, process.env.CLARITY_PROJECTS_FILE),
    path.join(projectRoot, "projects.local.json"),
    path.join(projectRoot, "..", ".vscode", "marketing.accounts.local.json"),
    path.join(projectRoot, "..", ".vscode", "clarity.projects.local.json"),
    path.join(projectRoot, "projects.json"),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function normalizeConfigPath(projectRoot, configPath) {
  if (!configPath) {
    return undefined;
  }

  return path.isAbsolute(configPath) ? configPath : path.resolve(projectRoot, configPath);
}

function normalizeWorkspaceConfigPath(projectRoot, configPath) {
  if (!configPath) {
    return undefined;
  }

  return path.isAbsolute(configPath)
    ? configPath
    : path.resolve(projectRoot, "..", configPath);
}

function normalizeProject(project) {
  const name = String(project.name || "").trim();
  const label = String(project.label || name).trim();
  const website = String(project.website || project.site_url || project.url || "").trim();
  const analyticsPropertyId =
    project.analytics_property_id ??
    project.analyticsPropertyId ??
    project.property_id ??
    project.propertyId ??
    project.analytics_id ??
    null;
  const token = String(
    project.token ||
      project.clarity_token ||
      project.clarityToken ||
      project.api_token ||
      process.env[project.tokenEnv] ||
      process.env[project.clarityTokenEnv] ||
      ""
  ).trim();

  if (!name) {
    throw new Error("Each Clarity project needs a non-empty name.");
  }

  return {
    name,
    label,
    website,
    analytics_property_id: analyticsPropertyId ? String(analyticsPropertyId).trim() : null,
    token,
  };
}

function selectProjectArray(parsed) {
  if (Array.isArray(parsed.projects)) {
    return parsed.projects;
  }

  if (Array.isArray(parsed.accounts)) {
    return parsed.accounts;
  }

  if (Array.isArray(parsed.properties)) {
    return parsed.properties;
  }

  return [];
}

function isPlaceholderToken(token) {
  return token.includes("PASTE_CLARITY") || token === "your_clarity_data_export_token";
}
