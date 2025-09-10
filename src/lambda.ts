import type { APIGatewayProxyEvent, Context, SQSEvent } from "aws-lambda";
import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import router from "./router";

type LambdaRequest = SQSEvent | APIGatewayProxyEvent;

const httpServer = (() => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/stage", router);

  return serverless(app);
})();

export const handler = (event: LambdaRequest, context: Context) => {
  console.log("Lambda started");

  if ("httpMethod" in event) {
    return httpServer(event, context);
  }

  return {
    status: "ok",
    event,
    context,
  };
};
