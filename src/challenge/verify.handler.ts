import type { VerifyAuthChallengeResponseTriggerEvent } from "aws-lambda";

export function isVerifyEvent(
  e: any
): e is VerifyAuthChallengeResponseTriggerEvent {
  return e.triggerSource === "VerifyAuthChallengeResponse_Authentication";
}

export default (event: VerifyAuthChallengeResponseTriggerEvent) => {
  const provided = event.request.challengeAnswer;
  const expected = event.request.privateChallengeParameters?.answer;
  event.response.answerCorrect = provided === expected;
  return event;
};
