import fs from "fs";
import path from "path";

export function loadProjects(projectRoot) {
  const configPath = resolveConfigPath(projectRoot);

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

  const rawConfig = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(rawConfig);
  const projects = Array.isArray(parsed.projects) ? parsed.projects : [];

  return { configPath, projects: projects.map(normalizeProject) };
}

export function listSafeProjects(projects) {
  return projects.map((project) => ({
    name: project.name,
    label: project.label,
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
    normalizeConfigPath(projectRoot, process.env.CLARITY_PROJECTS_FILE),
    path.join(projectRoot, "projects.local.json"),
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

function normalizeProject(project) {
  const name = String(project.name || "").trim();
  const label = String(project.label || name).trim();
  const token = String(project.token || process.env[project.tokenEnv] || "").trim();

  if (!name) {
    throw new Error("Each Clarity project needs a non-empty name.");
  }

  return { name, label, token };
}

function isPlaceholderToken(token) {
  return token.includes("PASTE_CLARITY") || token === "your_clarity_data_export_token";
}
