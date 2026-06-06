import { google } from "googleapis";

export function getTagManagerTools() {
  return [
    {
      name: "gtm_list_accounts",
      description: "List all Google Tag Manager accounts available to the authenticated user.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "gtm_list_containers",
      description: "List containers in a Google Tag Manager account.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: {
            type: "string",
            description: "Google Tag Manager account ID.",
          },
        },
        required: ["account_id"],
      },
    },
    {
      name: "gtm_list_tags",
      description: "List tags in a specific Google Tag Manager container.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Google Tag Manager account ID." },
          container_id: { type: "string", description: "Google Tag Manager container ID." },
          workspace_id: {
            type: "string",
            description: "Workspace ID. Defaults to 1 when workspace fallback is used.",
            default: "1",
          },
        },
        required: ["account_id", "container_id"],
      },
    },
    {
      name: "gtm_list_triggers",
      description: "List triggers in a specific Google Tag Manager container.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Google Tag Manager account ID." },
          container_id: { type: "string", description: "Google Tag Manager container ID." },
          workspace_id: { type: "string", description: "Workspace ID.", default: "1" },
        },
        required: ["account_id", "container_id"],
      },
    },
    {
      name: "gtm_list_variables",
      description: "List variables in a specific Google Tag Manager container.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Google Tag Manager account ID." },
          container_id: { type: "string", description: "Google Tag Manager container ID." },
          workspace_id: { type: "string", description: "Workspace ID.", default: "1" },
        },
        required: ["account_id", "container_id"],
      },
    },
    {
      name: "gtm_container_versions",
      description: "List container versions and publish metadata.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Google Tag Manager account ID." },
          container_id: { type: "string", description: "Google Tag Manager container ID." },
        },
        required: ["account_id", "container_id"],
      },
    },
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

  if (name === "gtm_list_tags") {
    const tags = await getBestWorkspaceData(gtm, args.account_id, args.container_id, "tags");
    return tags.map((t) => ({
      tagId: t.tagId,
      name: t.name,
      type: t.type,
      paused: t.paused,
      firingTriggerId: t.firingTriggerId,
      source: t._workspace,
    }));
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

  if (name === "gtm_list_variables") {
    const variables = await getBestWorkspaceData(gtm, args.account_id, args.container_id, "variables");
    return variables.map((v) => ({
      variableId: v.variableId,
      name: v.name,
      type: v.type,
      source: v._workspace,
    }));
  }

  if (name === "gtm_container_versions") {
    const res = await gtm.accounts.containers.version_headers.list({
      parent: `accounts/${args.account_id}/containers/${args.container_id}`,
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

  throw new Error(`Unknown Tag Manager tool: ${name}`);
}
