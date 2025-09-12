import type {
  APIGatewayProxyEvent,
  Context,
  PostAuthenticationTriggerEvent,
  PostConfirmationTriggerEvent,
  PreAuthenticationTriggerEvent,
  PreSignUpTriggerEvent,
  PreTokenGenerationTriggerEvent,
  SQSEvent,
} from "aws-lambda";
import cors from "cors";
import express from "express";
import session from "express-session";
import serverless from "serverless-http";
import challengeHandler, { isChallengeEvent } from "./challenge/handler";
import challengeRouter from "./challenge/router";
import config from "./config";
import logger from "./logger";
import { loggerMiddleware } from "./middlewares";
import router from "./router";

type CognitoEvent =
  | PreSignUpTriggerEvent
  | PostAuthenticationTriggerEvent
  | PostConfirmationTriggerEvent
  | PreAuthenticationTriggerEvent
  | PreTokenGenerationTriggerEvent;
type LambdaRequest = SQSEvent | APIGatewayProxyEvent | CognitoEvent;

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
  app.use(loggerMiddleware);
  app.use(`/${config.apiStage}`, router);
  app.use(`/${config.apiStage}`, challengeRouter);

  return serverless(app);
})();

export const handler = async (event: LambdaRequest, context: Context) => {
  try {
    logger.info("Lambda started");

    if ("httpMethod" in event) {
      return await httpServer(event, context);
    }
    if (isChallengeEvent(event)) {
      return await challengeHandler(event, context);
    }

    logger.debug("Event not handled", { event });

    return event;
  } catch (error) {
    logger.error("Lambda error", {
      event,
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
