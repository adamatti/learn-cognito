import type { CreateAuthChallengeTriggerEvent } from "aws-lambda";
import logger from "../logger";

export function isCreateEvent(e: any): e is CreateAuthChallengeTriggerEvent {
  return e.triggerSource === "CreateAuthChallenge_Authentication";
}

export default (event: CreateAuthChallengeTriggerEvent) => {
  // Generate a short code. Delivery is handled externally by the user.
  const code = Math.floor(100_000 + Math.random() * 900_000).toString();

  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = { answer: code };
  event.response.challengeMetadata = "MAGIC_LINK";

  // Do not send email here per user's request.
  logger.debug("Generated magic OTP", {
    code,
    user: event.request.userAttributes.email,
  });

  return event;
};
