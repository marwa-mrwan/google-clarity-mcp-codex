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

test("Business Profile registry excludes discontinued APIs", () => {
  const tools = getBusinessProfileTools();
  const names = new Set(tools.map((item) => item.name));
  const discontinued = [
    "gbp_business_calls_insights",
    "gbp_list_questions",
    "gbp_create_question",
    "gbp_update_question",
    "gbp_delete_question",
    "gbp_list_answers",
    "gbp_upsert_answer",
    "gbp_delete_answer",
  ];
  assert.equal(tools.length, 36);
  for (const name of discontinued) assert.equal(names.has(name), false);

  const genericCall = tools.find((item) => item.name === "gbp_api_call");
  const services = genericCall.inputSchema.properties.service.enum;
  assert.equal(services.includes("business_calls"), false);
  assert.equal(services.includes("q_and_a"), false);
});

test("Business Profile quota errors include safe setup guidance", async () => {
  const originalRequest = axios.request;
  axios.request = async () => {
    const error = new Error("Request failed with status code 429");
    error.response = {
      status: 429,
      data: { error: { status: "RESOURCE_EXHAUSTED" } },
    };
    throw error;
  };

  try {
    await assert.rejects(
      handleBusinessProfileTool("gbp_list_accounts", {}, authClient),
      (error) =>
        error.code === "GBP_QUOTA_EXHAUSTED" &&
        /Basic API Access/.test(error.message) &&
        /developers\.google\.com\/my-business\/content\/limits/.test(error.message)
    );
  } finally {
    axios.request = originalRequest;
  }
});

test("Merchant developer registration is guarded and unregistered projects get guidance", async () => {
  const tools = getMerchantCenterTools();
  assert.ok(tools.some((item) => item.name === "merchant_get_developer_registration"));
  assert.ok(tools.some((item) => item.name === "merchant_register_gcp"));

  const preview = await handleMerchantCenterTool(
    "merchant_register_gcp",
    { account_id: "123", developer_email: "developer@example.com" },
    authClient
  );
  assert.equal(preview.executed, false);
  assert.ok(preview.safety.blockedReasons.includes("dry_run is true"));
  assert.match(preview.safety.preview.endpoint, /accounts\/123\/developerRegistration:registerGcp$/);
  assert.deepEqual(preview.safety.preview.body, { developerEmail: "developer@example.com" });

  const originalRequest = axios.request;
  axios.request = async () => {
    const error = new Error("Request failed with status code 401");
    error.response = {
      status: 401,
      data: {
        error: {
          status: "UNAUTHENTICATED",
          message: "The GCP project is not registered with the merchant account.",
        },
      },
    };
    throw error;
  };

  try {
    await assert.rejects(
      handleMerchantCenterTool("merchant_list_accounts", {}, authClient),
      (error) =>
        error.code === "MERCHANT_GCP_NOT_REGISTERED" &&
        /merchant_register_gcp/.test(error.message) &&
        /developers\.google\.com\/merchant\/api\/guides\/quickstart\/direct-api-calls/.test(
          error.message
        )
    );
  } finally {
    axios.request = originalRequest;
  }
});
