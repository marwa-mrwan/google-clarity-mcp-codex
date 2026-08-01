import { getSearchConsoleTools } from "../google-mcp/lib/search-console.js";
import { getAnalyticsTools } from "../google-mcp/lib/analytics.js";
import { getAdsTools } from "../google-mcp/lib/ads.js";
import { getTagManagerTools } from "../google-mcp/lib/tag-manager.js";
import { getBusinessProfileTools } from "../google-mcp/lib/business-profile.js";
import { getMerchantCenterTools } from "../google-mcp/lib/merchant-center.js";
import { ALL_TOOLS as clarityTools } from "../clarity-mcp/index.js";

const googleTools = [
  ...getSearchConsoleTools(),
  ...getAnalyticsTools(),
  ...getAdsTools(),
  ...getTagManagerTools(),
  ...getBusinessProfileTools(),
  ...getMerchantCenterTools(),
];

const results = [
  { name: "google-marketing-suite", tools: googleTools.length },
  { name: "microsoft-clarity", tools: clarityTools.length },
];

for (const result of results) {
  console.log(`${result.name}: ${result.tools} tools`);
}

process.exit(0);
