import { getSearchConsoleTools } from "../google-mcp/lib/search-console.js";
import { getAnalyticsTools } from "../google-mcp/lib/analytics.js";
import { getAdsTools } from "../google-mcp/lib/ads.js";
import { getTagManagerTools } from "../google-mcp/lib/tag-manager.js";
import { getBusinessProfileTools } from "../google-mcp/lib/business-profile.js";
import { getMerchantCenterTools } from "../google-mcp/lib/merchant-center.js";
import { getPageSpeedTools } from "../google-mcp/lib/pagespeed.js";
import { getReportingTools } from "../google-mcp/lib/reporting.js";
import { ALL_TOOLS as clarityTools } from "../clarity-mcp/index.js";
import { ALL_TOOLS as mangoolsTools } from "../mangools-mcp/index.js";

const googleTools = [
  ...getSearchConsoleTools(),
  ...getAnalyticsTools(),
  ...getAdsTools(),
  ...getTagManagerTools(),
  ...getBusinessProfileTools(),
  ...getMerchantCenterTools(),
  ...getPageSpeedTools(),
  ...getReportingTools(),
];

const results = [
  { name: "google-marketing-suite", tools: googleTools.length },
  { name: "microsoft-clarity", tools: clarityTools.length },
  { name: "mangools", tools: mangoolsTools.length },
];

for (const result of results) {
  console.log(`${result.name}: ${result.tools} tools`);
}
