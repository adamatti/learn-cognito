import type { Context } from "aws-lambda";
import logger from "../logger";
import handleCreate, { isCreateEvent } from "./create.handler";
import handleDefine, { isDefineEvent } from "./define.handler";
import handleVerify, { isVerifyEvent } from "./verify.handler";

export const isChallengeEvent = (event: any) => {
  return isDefineEvent(event) || isCreateEvent(event) || isVerifyEvent(event);
};

export default async (event: any, context: Context) => {
  try {
    logger.info("Triggers handler started", {
      triggerSource: event.triggerSource,
    });

    if (isDefineEvent(event)) {
      return await handleDefine(event);
    }

    if (isCreateEvent(event)) {
      return await handleCreate(event);
    }

    if (isVerifyEvent(event)) {
      return await handleVerify(event);
    }

    logger.warn("Unhandled trigger", { triggerSource: event.triggerSource });
    return event;
  } catch (error) {
    logger.error("Trigger error", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
