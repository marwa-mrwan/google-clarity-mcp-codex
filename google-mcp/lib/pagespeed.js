import axios from "axios";

const PAGESPEED_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export function getPageSpeedTools() {
  return [
    {
      name: "psi_audit_url",
      description: "Run a PageSpeed Insights audit for a URL.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Public URL to audit.",
          },
          strategy: {
            type: "string",
            enum: ["mobile", "desktop"],
            description: "Device strategy. Defaults to mobile.",
            default: "mobile",
          },
          categories: {
            type: "array",
            items: {
              type: "string",
              enum: ["performance", "accessibility", "best-practices", "seo", "pwa"],
            },
            description: "Lighthouse categories to include.",
          },
        },
        required: ["url"],
      },
    },
  ];
}

export async function handlePageSpeedTool(name, args, authClient) {
  if (name !== "psi_audit_url") {
    throw new Error(`Unknown PageSpeed tool: ${name}`);
  }

  const { url, strategy = "mobile", categories = ["performance", "accessibility", "best-practices", "seo"] } = args;
  const headers = {};
  if (authClient) {
    const token = (await authClient.getAccessToken()).token;
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await axios.get(PAGESPEED_BASE, {
    headers,
    params: {
      url,
      strategy,
      category: categories,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  const lhr = res.data.lighthouseResult || {};
  const categoriesData = lhr.categories || {};
  const audits = lhr.audits || {};

  return {
    requestedUrl: res.data.id,
    finalUrl: lhr.finalDisplayedUrl,
    strategy,
    scores: Object.fromEntries(
      Object.entries(categoriesData).map(([key, value]) => [key, value?.score ?? null])
    ),
    coreWebVitalsAssessment: res.data.loadingExperience?.overall_category,
    loadingExperience: res.data.loadingExperience,
    originLoadingExperience: res.data.originLoadingExperience,
    metrics: {
      firstContentfulPaint: audits["first-contentful-paint"]?.displayValue,
      largestContentfulPaint: audits["largest-contentful-paint"]?.displayValue,
      cumulativeLayoutShift: audits["cumulative-layout-shift"]?.displayValue,
      speedIndex: audits["speed-index"]?.displayValue,
      totalBlockingTime: audits["total-blocking-time"]?.displayValue,
      interactionToNextPaint: audits["interaction-to-next-paint"]?.displayValue,
    },
  };
}
