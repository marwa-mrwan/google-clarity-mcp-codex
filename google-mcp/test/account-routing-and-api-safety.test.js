import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";

import { getAdsTools } from "../lib/ads.js";
import {
  getBusinessProfileTools,
  handleBusinessProfileTool,
} from "../lib/business-profile.js";
import {
  getMerchantCenterTools,
  handleMerchantCenterTool,
} from "../lib/merchant-center.js";

const authClient = {
  async getAccessToken() {
    return { token: "test-access-token" };
  },
};

test("all Google tool registries have unique names", () => {
  for (const tools of [getAdsTools(), getBusinessProfileTools(), getMerchantCenterTools()]) {
    const names = tools.map((item) => item.name);
    assert.equal(new Set(names).size, names.length);
  }
});

test("Google Ads exposes account discovery and MCC override on customer tools", () => {
  const tools = getAdsTools();
  assert.ok(tools.some((item) => item.name === "ads_discover_accounts"));
  const campaigns = tools.find((item) => item.name === "ads_list_campaigns");
  assert.equal(campaigns.inputSchema.properties.login_customer_id.type, "string");
});

test("Business Profile writes are dry-run and generic calls reject full URLs", async () => {
  const preview = await handleBusinessProfileTool(
    "gbp_update_location",
    {
      location_name: "locations/123",
      update_mask: "title",
      location: { name: "locations/123", title: "New title" },
    },
    authClient
  );
  assert.equal(preview.executed, false);
  assert.ok(preview.safety.blockedReasons.includes("dry_run is true"));
  assert.match(preview.safety.preview.endpoint, /mybusinessbusinessinformation\.googleapis\.com/);

  await assert.rejects(
    handleBusinessProfileTool(
      "gbp_api_call",
      { service: "business_information", method: "GET", path: "https://evil.example/x" },
      authClient
    ),
    /safe relative Google API path/
  );
});

test("Merchant writes are dry-run, reject full URLs, and keep account_id compatibility", async () => {
  const preview = await handleMerchantCenterTool(
    "merchant_insert_product_input",
    {
      account_name: "accounts/123",
      data_source: "accounts/123/dataSources/456",
      product_input: { offerId: "sku-1" },
    },
    authClient
  );
  assert.equal(preview.executed, false);
  assert.ok(preview.safety.blockedReasons.includes("dry_run is true"));

  await assert.rejects(
    handleMerchantCenterTool(
      "merchant_api_call",
      { service: "products", method: "GET", path: "https://evil.example/x" },
      authClient
    ),
    /safe relative Merchant API path/
  );

  const originalRequest = axios.request;
  let captured;
  axios.request = async (config) => {
    captured = config;
    return { data: { products: [] }, headers: {} };
  };
  try {
    await handleMerchantCenterTool(
      "merchant_list_products",
      { account_id: "123", page_size: 10 },
      authClient
    );
    assert.match(captured.url, /\/accounts\/123\/products$/);
    assert.equal(captured.params.pageSize, 10);
  } finally {
    axios.request = originalRequest;
  }
});
