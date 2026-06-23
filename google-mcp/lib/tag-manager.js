import { google } from "googleapis";

const GTM_BASE = "https://tagmanager.googleapis.com/tagmanager/v2";

const ids = {
  account_id: { type: "string", description: "Google Tag Manager account ID." },
  container_id: { type: "string", description: "Google Tag Manager container ID." },
  workspace_id: { type: "string", description: "Workspace ID.", default: "1" },
};

const confirmProperty = {
  confirm: {
    type: "boolean",
    description: "Must be true before write, publish, or delete requests execute.",
    default: false,
  },
};

const tool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  inputSchema: {
    type: "object",
    properties,
    required,
  },
});

function containerPath(args) {
  return `accounts/${args.account_id}/containers/${args.container_id}`;
}

function workspacePath(args) {
  return `${containerPath(args)}/workspaces/${args.workspace_id || "1"}`;
}

function cleanPath(path) {
  return String(path || "").replace(/^\/+/, "");
}

function requireConfirm(args, action) {
  if (args.confirm !== true) {
    throw new Error(`${action} requires confirm=true.`);
  }
}

async function gtmRequest(authClient, method, path, { query, body } = {}) {
  const token = (await authClient.getAccessToken()).token;
  const { default: axios } = await import("axios");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const queryString = params.toString();
  const res = await axios({
    method,
    url: `${GTM_BASE}/${cleanPath(path)}${queryString ? `?${queryString}` : ""}`,
    data: body,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data || {};
}

export function getTagManagerTools() {
  return [
    tool("gtm_list_accounts", "List all Google Tag Manager accounts available to the authenticated user."),
    tool("gtm_get_account", "Get one Google Tag Manager account.", { account_id: ids.account_id }, ["account_id"]),
    tool(
      "gtm_list_containers",
      "List containers in a Google Tag Manager account.",
      { account_id: ids.account_id },
      ["account_id"]
    ),
    tool(
      "gtm_get_container",
      "Get full details for a Google Tag Manager container.",
      { account_id: ids.account_id, container_id: ids.container_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_container_snippet",
      "Get the GTM container installation snippet.",
      { account_id: ids.account_id, container_id: ids.container_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_list_workspaces",
      "List workspaces in a Google Tag Manager container.",
      { account_id: ids.account_id, container_id: ids.container_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_get_workspace",
      "Get one Google Tag Manager workspace.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id", "workspace_id"]
    ),
    tool(
      "gtm_workspace_status",
      "Get workspace sync/conflict/status details.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id", "workspace_id"]
    ),
    tool(
      "gtm_quick_preview",
      "Create a quick preview for a workspace. Requires confirm=true because it creates a preview state.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id, ...confirmProperty },
      ["account_id", "container_id", "workspace_id", "confirm"]
    ),
    tool(
      "gtm_list_tags",
      "List tags in a specific Google Tag Manager container.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_get_tag",
      "Get full details for one GTM tag in a workspace.",
      {
        account_id: ids.account_id,
        container_id: ids.container_id,
        workspace_id: ids.workspace_id,
        tag_id: { type: "string", description: "GTM tag ID." },
      },
      ["account_id", "container_id", "workspace_id", "tag_id"]
    ),
    tool(
      "gtm_list_triggers",
      "List triggers in a specific Google Tag Manager container.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_get_trigger",
      "Get full details for one GTM trigger in a workspace.",
      {
        account_id: ids.account_id,
        container_id: ids.container_id,
        workspace_id: ids.workspace_id,
        trigger_id: { type: "string", description: "GTM trigger ID." },
      },
      ["account_id", "container_id", "workspace_id", "trigger_id"]
    ),
    tool(
      "gtm_list_variables",
      "List variables in a specific Google Tag Manager container.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_get_variable",
      "Get full details for one GTM variable in a workspace.",
      {
        account_id: ids.account_id,
        container_id: ids.container_id,
        workspace_id: ids.workspace_id,
        variable_id: { type: "string", description: "GTM variable ID." },
      },
      ["account_id", "container_id", "workspace_id", "variable_id"]
    ),
    tool(
      "gtm_list_built_in_variables",
      "List enabled GTM built-in variables in a workspace.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id", "workspace_id"]
    ),
    tool(
      "gtm_list_folders",
      "List folders in a GTM workspace.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id", "workspace_id"]
    ),
    tool(
      "gtm_list_templates",
      "List custom templates in a GTM workspace.",
      { account_id: ids.account_id, container_id: ids.container_id, workspace_id: ids.workspace_id },
      ["account_id", "container_id", "workspace_id"]
    ),
    tool(
      "gtm_container_versions",
      "List container versions and publish metadata.",
      { account_id: ids.account_id, container_id: ids.container_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_live_version",
      "Get the currently live GTM container version.",
      { account_id: ids.account_id, container_id: ids.container_id },
      ["account_id", "container_id"]
    ),
    tool(
      "gtm_get_version",
      "Get a specific GTM container version.",
      {
        account_id: ids.account_id,
        container_id: ids.container_id,
        version_id: { type: "string", description: "Container version ID." },
      },
      ["account_id", "container_id", "version_id"]
    ),
    tool(
      "gtm_api_call",
      "Advanced GTM API call for create/update/delete/publish operations not covered by named tools. Non-GET requests require confirm=true.",
      {
        method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], description: "HTTP method." },
        path: { type: "string", description: "Path relative to https://tagmanager.googleapis.com/tagmanager/v2/." },
        query: { type: "object", description: "Optional query parameters." },
        body: { type: "object", description: "Optional request body." },
        ...confirmProperty,
      },
      ["method", "path"]
    ),
  ];
}

async function getBestWorkspaceData(gtm, account_id, container_id, dataType) {
  let bestResult = [];

  try {
    const headersRes = await gtm.accounts.containers.version_headers.list({
      parent: `accounts/${account_id}/containers/${container_id}`,
    });
    const headers = (headersRes.data.containerVersionHeader || [])
      .filter((v) => !v.deleted)
      .sort((a, b) => Number(b.containerVersionId) - Number(a.containerVersionId));

    for (const header of headers.slice(0, 3)) {
      try {
        const verRes = await gtm.accounts.containers.versions.get({
          accountId: account_id,
          containerId: container_id,
          containerVersionId: header.containerVersionId,
        });
        const version = verRes.data;
        const items =
          dataType === "tags"
            ? version.tag || []
            : dataType === "triggers"
              ? version.trigger || []
              : version.variable || [];
        if (items.length > bestResult.length) {
          bestResult = items.map((i) => ({ ...i, _workspace: `v${header.containerVersionId}` }));
        }
      } catch {}
    }
  } catch {}

  try {
    const wsRes = await gtm.accounts.containers.workspaces.list({
      parent: `accounts/${account_id}/containers/${container_id}`,
    });
    const workspaces = (wsRes.data.workspace || []).sort(
      (a, b) => Number(b.workspaceId) - Number(a.workspaceId)
    );

    for (const ws of workspaces) {
      try {
        const parent = `accounts/${account_id}/containers/${container_id}/workspaces/${ws.workspaceId}`;
        let res;
        if (dataType === "tags") res = await gtm.accounts.containers.workspaces.tags.list({ parent });
        if (dataType === "triggers") {
          res = await gtm.accounts.containers.workspaces.triggers.list({ parent });
        }
        if (dataType === "variables") {
          res = await gtm.accounts.containers.workspaces.variables.list({ parent });
        }
        const items = res?.data?.tag || res?.data?.trigger || res?.data?.variable || [];
        if (items.length > bestResult.length) {
          bestResult = items.map((i) => ({ ...i, _workspace: `ws${ws.workspaceId}` }));
        }
      } catch {}
    }
  } catch {}

  return bestResult;
}

export async function handleTagManagerTool(name, args, authClient) {
  const gtm = google.tagmanager({ version: "v2", auth: authClient });

  if (name === "gtm_list_accounts") {
    const res = await gtm.accounts.list();
    return (res.data.account || []).map((a) => ({
      accountId: a.accountId,
      name: a.name,
      shareData: a.shareData,
    }));
  }

  if (name === "gtm_get_account") {
    const res = await gtm.accounts.get({ path: `accounts/${args.account_id}` });
    return res.data;
  }

  if (name === "gtm_list_containers") {
    const res = await gtm.accounts.containers.list({
      parent: `accounts/${args.account_id}`,
    });
    return (res.data.container || []).map((c) => ({
      containerId: c.containerId,
      name: c.name,
      publicId: c.publicId,
      usageContext: c.usageContext,
      domainName: c.domainName,
    }));
  }

  if (name === "gtm_get_container") {
    const res = await gtm.accounts.containers.get({ path: containerPath(args) });
    return res.data;
  }

  if (name === "gtm_container_snippet") {
    const res = await gtm.accounts.containers.snippet({ path: containerPath(args) });
    return res.data;
  }

  if (name === "gtm_list_workspaces") {
    const res = await gtm.accounts.containers.workspaces.list({ parent: containerPath(args) });
    return res.data.workspace || [];
  }

  if (name === "gtm_get_workspace") {
    const res = await gtm.accounts.containers.workspaces.get({ path: workspacePath(args) });
    return res.data;
  }

  if (name === "gtm_workspace_status") {
    const res = await gtm.accounts.containers.workspaces.getStatus({ path: workspacePath(args) });
    return res.data;
  }

  if (name === "gtm_quick_preview") {
    requireConfirm(args, "gtm_quick_preview");
    const res = await gtm.accounts.containers.workspaces.quick_preview({ path: workspacePath(args) });
    return res.data;
  }

  if (name === "gtm_list_tags") {
    const tags = await getBestWorkspaceData(gtm, args.account_id, args.container_id, "tags");
    return tags.map((t) => ({
      tagId: t.tagId,
      name: t.name,
      type: t.type,
      paused: t.paused,
      firingTriggerId: t.firingTriggerId,
      blockingTriggerId: t.blockingTriggerId,
      source: t._workspace,
    }));
  }

  if (name === "gtm_get_tag") {
    const res = await gtm.accounts.containers.workspaces.tags.get({
      path: `${workspacePath(args)}/tags/${args.tag_id}`,
    });
    return res.data;
  }

  if (name === "gtm_list_triggers") {
    const triggers = await getBestWorkspaceData(gtm, args.account_id, args.container_id, "triggers");
    return triggers.map((t) => ({
      triggerId: t.triggerId,
      name: t.name,
      type: t.type,
      source: t._workspace,
    }));
  }

  if (name === "gtm_get_trigger") {
    const res = await gtm.accounts.containers.workspaces.triggers.get({
      path: `${workspacePath(args)}/triggers/${args.trigger_id}`,
    });
    return res.data;
  }

  if (name === "gtm_list_variables") {
    const variables = await getBestWorkspaceData(gtm, args.account_id, args.container_id, "variables");
    return variables.map((v) => ({
      variableId: v.variableId,
      name: v.name,
      type: v.type,
      source: v._workspace,
    }));
  }

  if (name === "gtm_get_variable") {
    const res = await gtm.accounts.containers.workspaces.variables.get({
      path: `${workspacePath(args)}/variables/${args.variable_id}`,
    });
    return res.data;
  }

  if (name === "gtm_list_built_in_variables") {
    const res = await gtm.accounts.containers.workspaces.built_in_variables.list({
      parent: workspacePath(args),
    });
    return res.data.builtInVariable || [];
  }

  if (name === "gtm_list_folders") {
    const res = await gtm.accounts.containers.workspaces.folders.list({ parent: workspacePath(args) });
    return res.data.folder || [];
  }

  if (name === "gtm_list_templates") {
    const res = await gtm.accounts.containers.workspaces.templates.list({ parent: workspacePath(args) });
    return res.data.template || [];
  }

  if (name === "gtm_container_versions") {
    const res = await gtm.accounts.containers.version_headers.list({
      parent: containerPath(args),
    });
    return (res.data.containerVersionHeader || []).map((v) => ({
      containerVersionId: v.containerVersionId,
      name: v.name,
      numTags: v.numTags,
      numTriggers: v.numTriggers,
      numVariables: v.numVariables,
      deleted: v.deleted,
    }));
  }

  if (name === "gtm_live_version") {
    const res = await gtm.accounts.containers.versions.live({ parent: containerPath(args) });
    return res.data;
  }

  if (name === "gtm_get_version") {
    const res = await gtm.accounts.containers.versions.get({
      path: `${containerPath(args)}/versions/${args.version_id}`,
    });
    return res.data;
  }

  if (name === "gtm_api_call") {
    const method = String(args.method || "GET").toUpperCase();
    if (method !== "GET") requireConfirm(args, `gtm_api_call ${method}`);
    return gtmRequest(authClient, method, args.path, {
      query: args.query,
      body: args.body,
    });
  }

  throw new Error(`Unknown Tag Manager tool: ${name}`);
}
