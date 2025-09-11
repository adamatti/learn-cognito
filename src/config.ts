import logger from "./logger";

const config = {
  aws: {
    region: process.env.AWS_REGION!,
  },
  session: {
    secret: "theultimatesecret",
  },
  cognito: {
    clientId: process.env.COGNITO_CLIENT_ID!,
    poolId: process.env.COGNITO_POOL_ID!,
    domainName: process.env.COGNITO_DOMAIN_NAME!,
  },
  apiUrl: process.env.API_URL!,
  apiStage: process.env.API_GATEWAY_STAGE!,
};

logger.debug("Started with config", { config });

export default config;
