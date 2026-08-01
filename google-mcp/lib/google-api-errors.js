const GBP_QUOTA_DOCS = "https://developers.google.com/my-business/content/limits";
const MERCHANT_REGISTRATION_DOCS =
  "https://developers.google.com/merchant/api/guides/quickstart/direct-api-calls";

function errorMetadata(error) {
  return {
    status: error?.response?.status ?? null,
    apiStatus: error?.response?.data?.error?.status ?? null,
    apiMessage: String(error?.response?.data?.error?.message ?? ""),
  };
}

function actionableError(message, code, metadata, cause) {
  const error = new Error(message, { cause });
  error.code = code;
  error.status = metadata.status;
  error.apiStatus = metadata.apiStatus;
  return error;
}

export function enhanceBusinessProfileError(error) {
  const metadata = errorMetadata(error);
  if (metadata.status === 429 || metadata.apiStatus === "RESOURCE_EXHAUSTED") {
    return actionableError(
      `Google Business Profile quota is exhausted. Check the API quota in Google Cloud Console. ` +
        `If the quota limit is 0, request Basic API Access instead of a quota increase. ${GBP_QUOTA_DOCS}`,
      "GBP_QUOTA_EXHAUSTED",
      metadata,
      error
    );
  }
  return error;
}

export function enhanceMerchantError(error) {
  const metadata = errorMetadata(error);
  const projectNotRegistered =
    metadata.status === 401 &&
    /(?:gcp|cloud) project.*not registered.*merchant|not registered with (?:the )?merchant/i.test(
      metadata.apiMessage
    );

  if (projectNotRegistered) {
    return actionableError(
      `The Google Cloud project is not registered with this Merchant Center account. ` +
        `Use merchant_register_gcp with the Merchant account ID and developer email, then retry after five minutes. ` +
        MERCHANT_REGISTRATION_DOCS,
      "MERCHANT_GCP_NOT_REGISTERED",
      metadata,
      error
    );
  }
  return error;
}
