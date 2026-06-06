const commonProperties = {
  query: {
    type: "object",
    description: "Optional query string parameters to pass directly to the Mangools endpoint.",
    additionalProperties: true,
  },
  body: {
    type: "object",
    description: "Optional JSON request body to pass directly to POST/PUT/PATCH/DELETE endpoints.",
    additionalProperties: true,
  },
};

export function endpointTool({
  name,
  description,
  method,
  path,
  pathParams = [],
  properties = {},
  required = [],
}) {
  return {
    name,
    description,
    method,
    path,
    pathParams,
    inputSchema: {
      type: "object",
      properties: {
        ...Object.fromEntries(
          pathParams.map((param) => [
            param,
            {
              type: "string",
              description: `Path parameter: ${param}`,
            },
          ])
        ),
        ...properties,
        ...commonProperties,
      },
      required: [...pathParams, ...required],
      additionalProperties: true,
    },
  };
}

export function exposeTools(definitions) {
  return definitions.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  }));
}

function fillPath(path, args, pathParams) {
  return pathParams.reduce((current, param) => {
    const value = args[param];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing required path parameter: ${param}`);
    }
    return current.replace(`{${param}}`, encodeURIComponent(String(value)));
  }, path);
}

function pickPayload(definition, args) {
  const pathParamSet = new Set(definition.pathParams);
  const reserved = new Set(["query", "body"]);
  const looseArgs = {};

  for (const [key, value] of Object.entries(args || {})) {
    if (!pathParamSet.has(key) && !reserved.has(key) && value !== undefined) {
      looseArgs[key] = value;
    }
  }

  const query = {
    ...(args?.query || {}),
    ...(["GET", "DELETE"].includes(definition.method) ? looseArgs : {}),
  };

  const body = ["GET"].includes(definition.method)
    ? args?.body
    : {
        ...(args?.body || {}),
        ...(!["GET", "DELETE"].includes(definition.method) ? looseArgs : {}),
      };

  return {
    query: Object.keys(query).length ? query : undefined,
    body: body && Object.keys(body).length ? body : undefined,
  };
}

export async function handleEndpointTool(definitions, name, args, client) {
  const definition = definitions.find((tool) => tool.name === name);
  if (!definition) {
    throw new Error(`Unknown Mangools tool: ${name}`);
  }

  const path = fillPath(definition.path, args || {}, definition.pathParams);
  const { query, body } = pickPayload(definition, args || {});
  return client.request({
    method: definition.method,
    path,
    query,
    body,
  });
}
