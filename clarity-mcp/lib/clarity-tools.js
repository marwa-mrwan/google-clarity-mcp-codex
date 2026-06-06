export const CLARITY_DIMENSIONS = [
  "Browser",
  "Device",
  "Country",
  "OS",
  "Source",
  "Medium",
  "Campaign",
  "Channel",
  "URL",
];

export const CLARITY_METRICS = [
  "Traffic",
  "EngagementTime",
  "ScrollDepth",
  "PopularPages",
  "Browser",
  "Device",
  "OS",
  "Country",
  "PageTitle",
  "ReferrerUrl",
  "DeadClickCount",
  "ExcessiveScroll",
  "RageClickCount",
  "QuickbackClick",
  "ScriptErrorCount",
  "ErrorClickCount",
];

const DIMENSION_ALIASES = {
  "Country/Region": "Country",
};

const METRIC_ALIASES = {
  "Scroll Depth": "ScrollDepth",
  "Engagement Time": "EngagementTime",
  "Popular Pages": "PopularPages",
  "Country/Region": "Country",
  "Page Title": "PageTitle",
  "Referrer URL": "ReferrerUrl",
  "Dead Click Count": "DeadClickCount",
  "Excessive Scroll": "ExcessiveScroll",
  "Rage Click Count": "RageClickCount",
  "Quickback Click": "QuickbackClick",
  "Script Error Count": "ScriptErrorCount",
  "Error Click Count": "ErrorClickCount",
};

const dimensionProperty = {
  type: "string",
  enum: [...CLARITY_DIMENSIONS, ...Object.keys(DIMENSION_ALIASES)],
  description: "Microsoft Clarity dimension to break down insights by.",
};

const metricNamesProperty = {
  type: "array",
  items: {
    type: "string",
    enum: [...CLARITY_METRICS, ...Object.keys(METRIC_ALIASES)],
  },
  description:
    "Optional metric names to keep in the response. Omit to return all metrics from Clarity.",
};

const projectNameProperty = {
  type: "string",
  description:
    "Configured Clarity project name from projects.json. Optional only when one project is configured.",
};

const projectNamesProperty = {
  type: "array",
  items: { type: "string" },
  minItems: 1,
  uniqueItems: true,
  description: "Configured Clarity project names from projects.json.",
};

const questionProperty = {
  type: "string",
  description:
    "Arabic or English analysis question, for example: analyze UX issues, traffic sources, rage clicks, or top pages.",
};

export function getClarityTools() {
  return [
    {
      name: "clarity_list_projects",
      description:
        "List configured Microsoft Clarity projects without exposing API tokens. This does not call the Clarity API.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: "clarity_options",
      description:
        "List Microsoft Clarity Data Export API dimensions, metrics, quotas, and limits. This does not call the Clarity API.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: "clarity_prepare_request",
      description:
        "Plan a Microsoft Clarity request before spending API quota. Use this first for vague analysis requests; it returns missing fields, recommended metrics/dimensions, and estimated API calls without calling Clarity.",
      inputSchema: {
        type: "object",
        properties: {
          question: questionProperty,
          project_name: projectNameProperty,
          project_names: projectNamesProperty,
          all_projects: {
            type: "boolean",
            description:
              "Set true only when the user explicitly wants every configured Clarity project.",
          },
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Optional requested range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
          },
          metric_names: metricNamesProperty,
        },
        additionalProperties: false,
      },
    },
    {
      name: "clarity_live_insights",
      description:
        "Fetch Microsoft Clarity dashboard data for one project after the request scope is clear. Uses one Clarity API call.",
      inputSchema: {
        type: "object",
        properties: {
          project_name: projectNameProperty,
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Data export range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
            description:
              "Preferred way to pass dimensions. Values are mapped to dimension1, dimension2, and dimension3.",
          },
          dimension1: dimensionProperty,
          dimension2: dimensionProperty,
          dimension3: dimensionProperty,
          metric_names: metricNamesProperty,
        },
        required: ["numOfDays"],
        additionalProperties: false,
      },
    },
    {
      name: "clarity_metric_summary",
      description:
        "Fetch selected Clarity metric groups for one project after the request scope is clear. Uses one Clarity API call.",
      inputSchema: {
        type: "object",
        properties: {
          project_name: projectNameProperty,
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Data export range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
            description:
              "Preferred way to pass dimensions. Values are mapped to dimension1, dimension2, and dimension3.",
          },
          dimension1: dimensionProperty,
          dimension2: dimensionProperty,
          dimension3: dimensionProperty,
          metric_names: {
            ...metricNamesProperty,
            minItems: 1,
          },
        },
        required: ["numOfDays", "metric_names"],
        additionalProperties: false,
      },
    },
    {
      name: "clarity_batch_insights",
      description:
        "Fetch the same Clarity insights for multiple projects in one MCP call. Uses one Clarity API call per selected project.",
      inputSchema: {
        type: "object",
        properties: {
          project_names: projectNamesProperty,
          all_projects: {
            type: "boolean",
            description:
              "Set true only when the user explicitly wants every configured Clarity project.",
          },
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Data export range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
          },
          dimension1: dimensionProperty,
          dimension2: dimensionProperty,
          dimension3: dimensionProperty,
          metric_names: metricNamesProperty,
        },
        required: ["numOfDays"],
        additionalProperties: false,
      },
    },
    {
      name: "clarity_compare_projects",
      description:
        "Compare selected Clarity projects on the same metrics/dimensions in one MCP call. Uses one Clarity API call per selected project.",
      inputSchema: {
        type: "object",
        properties: {
          project_names: projectNamesProperty,
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Data export range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
          },
          metric_names: metricNamesProperty,
        },
        required: ["project_names", "numOfDays"],
        additionalProperties: false,
      },
    },
    {
      name: "clarity_analyze_project",
      description:
        "Analyze one Clarity project locally after fetching the selected data once. Useful for UX friction, traffic, top pages, device/browser, and error/rage/dead-click analysis.",
      inputSchema: {
        type: "object",
        properties: {
          project_name: projectNameProperty,
          question: questionProperty,
          numOfDays: {
            type: "integer",
            enum: [1, 2, 3],
            description: "Data export range: 1, 2, or 3 previous days.",
          },
          dimensions: {
            type: "array",
            items: dimensionProperty,
            minItems: 0,
            maxItems: 3,
            uniqueItems: true,
          },
          metric_names: metricNamesProperty,
        },
        required: ["project_name", "question", "numOfDays"],
        additionalProperties: false,
      },
    },
  ];
}

function normalizeNumOfDays(value) {
  const normalized = Number(value);
  if (![1, 2, 3].includes(normalized)) {
    throw new Error("numOfDays must be 1, 2, or 3.");
  }
  return normalized;
}

function normalizeDimensions(args = {}) {
  const fromArray = Array.isArray(args.dimensions) ? args.dimensions : [];
  const fromNamed = [args.dimension1, args.dimension2, args.dimension3].filter(Boolean);
  const dimensions = fromArray.length ? fromArray : fromNamed;

  if (dimensions.length > 3) {
    throw new Error("Clarity supports a maximum of three dimensions per request.");
  }

  const unique = new Set();
  const normalizedDimensions = dimensions.map((dimension) => DIMENSION_ALIASES[dimension] || dimension);
  for (const dimension of normalizedDimensions) {
    if (!CLARITY_DIMENSIONS.includes(dimension)) {
      throw new Error(
        `Unsupported Clarity dimension "${dimension}". Use clarity_options to list supported dimensions.`
      );
    }
    if (unique.has(dimension)) {
      throw new Error(`Duplicate Clarity dimension "${dimension}".`);
    }
    unique.add(dimension);
  }

  return normalizedDimensions;
}

function normalizeMetricNames(metricNames) {
  if (!metricNames) {
    return undefined;
  }
  if (!Array.isArray(metricNames)) {
    throw new Error("metric_names must be an array.");
  }
  const normalizedMetricNames = metricNames.map(
    (metricName) => METRIC_ALIASES[metricName] || metricName
  );
  for (const metricName of normalizedMetricNames) {
    if (!CLARITY_METRICS.includes(metricName)) {
      throw new Error(
        `Unsupported Clarity metric "${metricName}". Use clarity_options to list supported metrics.`
      );
    }
  }
  return normalizedMetricNames;
}

function inferMetrics(question = "") {
  const normalizedQuestion = String(question).toLowerCase();
  const selected = new Set();

  if (/(ux|rage|dead|click|friction|مشك|ضغط|كليك|غضب|تجربة)/i.test(normalizedQuestion)) {
    selected.add("DeadClickCount");
    selected.add("RageClickCount");
    selected.add("QuickbackClick");
    selected.add("ExcessiveScroll");
    selected.add("ErrorClickCount");
  }
  if (/(traffic|source|channel|campaign|medium|ترافيك|مصدر|قناة|حملة)/i.test(normalizedQuestion)) {
    selected.add("Traffic");
    selected.add("EngagementTime");
  }
  if (/(page|url|landing|صفحة|صفحات|لينك|رابط)/i.test(normalizedQuestion)) {
    selected.add("PopularPages");
    selected.add("PageTitle");
    selected.add("ScrollDepth");
  }
  if (/(error|script|bug|خطأ|اخطاء|سكريبت)/i.test(normalizedQuestion)) {
    selected.add("ScriptErrorCount");
    selected.add("ErrorClickCount");
  }
  if (/(device|browser|os|mobile|desktop|موبايل|جهاز|متصفح)/i.test(normalizedQuestion)) {
    selected.add("Device");
    selected.add("Browser");
    selected.add("OS");
  }

  if (!selected.size) {
    return ["Traffic", "EngagementTime", "DeadClickCount", "RageClickCount", "PopularPages"];
  }

  return [...selected];
}

function inferDimensions(question = "") {
  const normalizedQuestion = String(question).toLowerCase();
  const selected = [];

  if (/(source|channel|campaign|medium|ترافيك|مصدر|قناة|حملة)/i.test(normalizedQuestion)) {
    selected.push("Source", "Medium", "Campaign");
  } else if (/(page|url|landing|صفحة|صفحات|لينك|رابط)/i.test(normalizedQuestion)) {
    selected.push("URL");
  } else if (/(device|browser|os|mobile|desktop|موبايل|جهاز|متصفح)/i.test(normalizedQuestion)) {
    selected.push("Device", "Browser", "OS");
  } else if (/(country|region|بلد|دولة|منطقة)/i.test(normalizedQuestion)) {
    selected.push("Country");
  }

  return selected.slice(0, 3);
}

function buildParams(args) {
  const numOfDays = normalizeNumOfDays(args?.numOfDays);
  const dimensions = normalizeDimensions(args);
  const params = { numOfDays };

  dimensions.forEach((dimension, index) => {
    params[`dimension${index + 1}`] = dimension;
  });

  return { params, dimensions };
}

function selectProjects(args, context, { allowAll = false } = {}) {
  if (args?.all_projects) {
    if (!allowAll) {
      throw new Error("all_projects is not supported for this tool.");
    }
    return context.getProjectNames().map((projectName) => context.resolveProject(projectName));
  }

  if (Array.isArray(args?.project_names) && args.project_names.length) {
    return args.project_names.map((projectName) => context.resolveProject(projectName));
  }

  if (args?.project_name) {
    return [context.resolveProject(args.project_name)];
  }

  throw new Error("Missing project_name or project_names. Use clarity_list_projects first.");
}

function filterMetrics(data, metricNames) {
  const normalizedMetricNames = normalizeMetricNames(metricNames);
  if (!normalizedMetricNames) {
    return data;
  }

  const wanted = new Set(normalizedMetricNames);
  return Array.isArray(data)
    ? data.filter((metricGroup) => wanted.has(metricGroup.metricName))
    : data;
}

function buildMetadata(args, project, dimensions, metricNames) {
  return {
    source: "Microsoft Clarity Data Export API",
    project: {
      name: project.name,
      label: project.label,
    },
    timezone: "UTC",
    requested_days: Number(args.numOfDays),
    dimensions,
    metric_names: metricNames || "all",
    quota_note: "Clarity allows 10 API requests per project per day.",
  };
}

async function fetchProjectInsights(project, args, context) {
  const client = context.createClient(project);
  const { params, dimensions } = buildParams(args || {});
  const metricNames = normalizeMetricNames(args?.metric_names);
  const data = await client.getLiveInsights(params);

  return {
    metadata: buildMetadata(args, project, dimensions, metricNames),
    data: filterMetrics(data, metricNames),
  };
}

function summarizeMetricGroup(metricGroup) {
  const rows =
    metricGroup?.information ||
    metricGroup?.data ||
    metricGroup?.values ||
    metricGroup?.sessions ||
    [];

  if (!Array.isArray(rows)) {
    return {
      metricName: metricGroup.metricName,
      rowCount: null,
      topRows: [],
    };
  }

  return {
    metricName: metricGroup.metricName,
    rowCount: rows.length,
    topRows: rows.slice(0, 5),
  };
}

function buildProjectAnalysis(result, question) {
  const data = Array.isArray(result.data) ? result.data : [];
  const availableMetrics = data.map((metricGroup) => metricGroup.metricName);
  const requested = new Set(normalizeMetricNames(result.metadata.metric_names === "all" ? undefined : result.metadata.metric_names) || []);
  const metricGroups = data
    .filter((metricGroup) => !requested.size || requested.has(metricGroup.metricName))
    .map(summarizeMetricGroup);

  return {
    question,
    project: result.metadata.project,
    scope: {
      requested_days: result.metadata.requested_days,
      dimensions: result.metadata.dimensions,
      api_calls_used: 1,
    },
    availableMetrics,
    metricGroups,
    practical_reading: buildPracticalReading(metricGroups),
    next_best_request:
      "لو محتاج تفصيل أعمق، اختار dimension واحدة أو اتنين فقط في الطلب الجاي عشان نحافظ على limit الـ 10 calls/day.",
  };
}

function buildPracticalReading(metricGroups) {
  const metricNames = new Set(metricGroups.map((group) => group.metricName));
  const reading = [];

  if (metricNames.has("RageClickCount") || metricNames.has("DeadClickCount")) {
    reading.push("راجع الصفحات أو العناصر اللي فيها Rage/Dead clicks لأنها غالبا بتشير لزرار مش واضح، عنصر غير قابل للضغط، أو UI بيخدع المستخدم.");
  }
  if (metricNames.has("QuickbackClick")) {
    reading.push("Quickback عالي معناه إن المستخدم دخل صفحة ورجع بسرعة؛ راجع توافق عنوان الصفحة مع نية الزيارة.");
  }
  if (metricNames.has("Traffic") || metricNames.has("EngagementTime")) {
    reading.push("قارن الترافيك مع EngagementTime؛ مصدر زيارات عالي مع وقت قليل غالبا محتاج landing page أو targeting أنضف.");
  }
  if (metricNames.has("ScriptErrorCount") || metricNames.has("ErrorClickCount")) {
    reading.push("الأخطاء التقنية لازم تتراجع قبل أي تحسينات تسويقية لأنها ممكن تكسر التحويل حتى لو الترافيك جيد.");
  }
  if (metricNames.has("ScrollDepth")) {
    reading.push("ScrollDepth الضعيف بيقول إن المحتوى المهم غالبا بعيد أو بداية الصفحة مش مقنعة كفاية.");
  }

  return reading;
}

function compareResults(results) {
  return results.map((result) => ({
    project: result.metadata.project,
    requested_days: result.metadata.requested_days,
    dimensions: result.metadata.dimensions,
    metricGroups: Array.isArray(result.data)
      ? result.data.map((metricGroup) => ({
          metricName: metricGroup.metricName,
          rowCount: Array.isArray(metricGroup.information) ? metricGroup.information.length : null,
        }))
      : [],
  }));
}

export async function handleClarityTool(name, args, context) {
  if (name === "clarity_list_projects") {
    return {
      config_path: context.configPath,
      projects: context.listProjects(),
    };
  }

  if (name === "clarity_options") {
    return {
      dimensions: CLARITY_DIMENSIONS,
      metrics: CLARITY_METRICS,
      aliases: {
        dimensions: DIMENSION_ALIASES,
        metrics: METRIC_ALIASES,
      },
      limits: {
        numOfDays: [1, 2, 3],
        maxDimensions: 3,
        maxRows: 1000,
        pagination: false,
        dailyRequestsPerProject: 10,
        timezone: "UTC",
      },
    };
  }

  if (name === "clarity_prepare_request") {
    const projectsRequested = args?.all_projects
      ? context.getProjectNames()
      : args?.project_names || (args?.project_name ? [args.project_name] : []);
    const missing = [];
    if (!projectsRequested.length) missing.push("project_name or project_names");
    if (!args?.numOfDays) missing.push("numOfDays");
    if (!args?.question && !args?.metric_names) missing.push("question or metric_names");

    const recommendedMetrics = normalizeMetricNames(args?.metric_names) || inferMetrics(args?.question);
    const recommendedDimensions = normalizeDimensions({ dimensions: args?.dimensions || inferDimensions(args?.question) });

    return {
      status: missing.length ? "needs_input" : "ready",
      missing_fields: missing,
      requested_projects: projectsRequested,
      estimated_api_calls: projectsRequested.length || 0,
      recommended: {
        numOfDays: args?.numOfDays || 1,
        dimensions: recommendedDimensions,
        metric_names: recommendedMetrics,
      },
      quota_note:
        "Use one final API tool call after confirming these fields. Each selected project costs one Clarity API call.",
    };
  }

  if (name === "clarity_live_insights" || name === "clarity_metric_summary") {
    const project = context.resolveProject(args?.project_name);
    return fetchProjectInsights(project, args, context);
  }

  if (name === "clarity_batch_insights") {
    const projects = selectProjects(args, context, { allowAll: true });
    const results = [];
    for (const project of projects) {
      results.push(await fetchProjectInsights(project, args, context));
    }

    return {
      metadata: {
        project_count: projects.length,
        api_calls_used: projects.length,
        quota_note: "One Clarity API call was used per selected project.",
      },
      results,
    };
  }

  if (name === "clarity_compare_projects") {
    const projects = selectProjects(args, context);
    const results = [];
    for (const project of projects) {
      results.push(await fetchProjectInsights(project, args, context));
    }

    return {
      metadata: {
        project_count: projects.length,
        api_calls_used: projects.length,
        quota_note: "One Clarity API call was used per selected project.",
      },
      comparison: compareResults(results),
      results,
    };
  }

  if (name === "clarity_analyze_project") {
    const project = context.resolveProject(args?.project_name);
    const plannedArgs = {
      ...args,
      dimensions: args?.dimensions || inferDimensions(args?.question),
      metric_names: args?.metric_names || inferMetrics(args?.question),
    };
    const result = await fetchProjectInsights(project, plannedArgs, context);
    return buildProjectAnalysis(result, args.question);
  }

  throw new Error(`Unknown Clarity tool: ${name}`);
}
