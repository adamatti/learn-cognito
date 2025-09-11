import type { APIGatewayProxyEvent, Context, SQSEvent } from "aws-lambda";
import cors from "cors";
import express from "express";
import session from "express-session";
import serverless from "serverless-http";
import config from "./config";
import logger from "./logger";
import router from "./router";

type LambdaRequest = SQSEvent | APIGatewayProxyEvent;

const httpServer = (() => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(`/${config.apiStage}`, router);

  return serverless(app);
})();

export const handler = (event: LambdaRequest, context: Context) => {
  logger.info("Lambda started");

  if ("httpMethod" in event) {
    return httpServer(event, context);
  }

  return {
    status: "ok",
    event,
    context,
  };
};
