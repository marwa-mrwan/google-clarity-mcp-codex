import axios from "axios";

const MERCHANT_ACCOUNTS_BASE = "https://merchantapi.googleapis.com/accounts/v1";
const MERCHANT_PRODUCTS_BASE = "https://merchantapi.googleapis.com/products/v1";
const MERCHANT_REPORTS_BASE = "https://merchantapi.googleapis.com/reports/v1";

async function getHeaders(authClient) {
  const token = (await authClient.getAccessToken()).token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function getMerchantCenterTools() {
  return [
    {
      name: "merchant_list_accounts",
      description: "List Merchant Center accounts available to the authenticated user.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "merchant_list_subaccounts",
      description: "List Merchant Center subaccounts for an advanced account.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: {
            type: "string",
            description: "Merchant Center account ID.",
          },
        },
        required: ["account_id"],
      },
    },
    {
      name: "merchant_list_products",
      description: "List processed products in a Merchant Center account.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Merchant Center account ID." },
          page_size: {
            type: "number",
            description: "Maximum number of products to return. Defaults to 50.",
            default: 50,
          },
        },
        required: ["account_id"],
      },
    },
    {
      name: "merchant_list_issues",
      description: "List Merchant Center account issues for an account.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Merchant Center account ID." },
          page_size: {
            type: "number",
            description: "Maximum number of issues to return. Defaults to 50.",
            default: 50,
          },
        },
        required: ["account_id"],
      },
    },
    {
      name: "merchant_search_report",
      description: "Run a Merchant Center report query.",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Merchant Center account ID." },
          query: {
            type: "string",
            description: "Merchant Center Query Language query.",
          },
          page_size: {
            type: "number",
            description: "Maximum number of rows to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["account_id", "query"],
      },
    },
  ];
}

export async function handleMerchantCenterTool(name, args, authClient) {
  const headers = await getHeaders(authClient);

  if (name === "merchant_list_accounts") {
    const res = await axios.get(`${MERCHANT_ACCOUNTS_BASE}/accounts`, { headers });
    return (res.data.accounts || []).map((account) => ({
      name: account.name,
      accountId: account.accountId,
      accountName: account.accountName,
      adultContent: account.adultContent,
      languageCode: account.languageCode,
      homepage: account.homepage,
      timeZone: account.timeZone,
      testAccount: account.testAccount,
    }));
  }

  if (name === "merchant_list_subaccounts") {
    const { account_id } = args;
    const res = await axios.get(`${MERCHANT_ACCOUNTS_BASE}/accounts/${account_id}:listSubaccounts`, {
      headers,
    });
    return res.data.accounts || [];
  }

  if (name === "merchant_list_products") {
    const { account_id, page_size = 50 } = args;
    const res = await axios.get(`${MERCHANT_PRODUCTS_BASE}/accounts/${account_id}/products`, {
      headers,
      params: {
        pageSize: Math.min(Number(page_size) || 50, 250),
      },
    });
    return res.data.products || [];
  }

  if (name === "merchant_list_issues") {
    const { account_id, page_size = 50 } = args;
    const res = await axios.get(`${MERCHANT_ACCOUNTS_BASE}/accounts/${account_id}/issues`, {
      headers,
      params: {
        pageSize: Math.min(Number(page_size) || 50, 100),
      },
    });
    return res.data.accountIssues || res.data.issues || [];
  }

  if (name === "merchant_search_report") {
    const { account_id, query, page_size = 100 } = args;
    const res = await axios.post(
      `${MERCHANT_REPORTS_BASE}/accounts/${account_id}/reports:search`,
      {
        query,
        pageSize: Math.min(Number(page_size) || 100, 1000),
      },
      { headers }
    );
    return {
      results: res.data.results || [],
      nextPageToken: res.data.nextPageToken,
    };
  }

  throw new Error(`Unknown Merchant Center tool: ${name}`);
}
