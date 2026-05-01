function readString(name, fallback = "") {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBool(name, fallback = false) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

function readList(name) {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const ragMode = readString("RAG_PROVIDER_MODE", "cli");

export const env = {
  nodeEnv: readString("NODE_ENV", "development"),
  serviceName: readString("SERVICE_NAME", "ly-node-api"),
  port: readInt("PORT", 5000),
  apiPrefix: readString("API_PREFIX", "/api/v1"),
  jsonBodyLimit: readString("JSON_BODY_LIMIT", "1mb"),
  corsOrigins: readList("CORS_ORIGINS"),
  gatewayApiKey: readString("GATEWAY_API_KEY", ""),
  fastApiBaseUrl: readString("FASTAPI_BASE_URL", "http://127.0.0.1:8000"),
  fastApiTimeoutMs: readInt("FASTAPI_TIMEOUT_MS", 45000),
  ragProviderMode: ragMode === "http" ? "http" : "cli",
  blockchainStoreScript: readString("BLOCKCHAIN_STORE_SCRIPT", "store-proof:base-sepolia"),
  blockchainNetwork: readString("BLOCKCHAIN_NETWORK", "base-sepolia"),
  blockchainDeploymentFile: readString(
    "BLOCKCHAIN_DEPLOYMENT_FILE",
    "Blockchain/deployments/ComplianceAudit.base-sepolia.json"
  ),
  blockchainWriteEnabled: readBool("BLOCKCHAIN_WRITE_ENABLED", true),
  mongoUri: readString("MONGO_URI", "mongodb://localhost:27017"),
  mongoDb: readString("MONGO_DB", "compliance_engine"),
  jwtSecret: readString("JWT_SECRET", "finace_dev_jwt_secret_change_me"),
};
