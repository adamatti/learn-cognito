import type { DefineAuthChallengeTriggerEvent } from "aws-lambda";

export function isDefineEvent(e: any): e is DefineAuthChallengeTriggerEvent {
  return e.triggerSource === "DefineAuthChallenge_Authentication";
}

export default (event: DefineAuthChallengeTriggerEvent) => {
  const session = event.request.session || [];
  const lastAttempt = session[session.length - 1];

  // If correct answer was provided, issue tokens
  if (lastAttempt && lastAttempt.challengeResult === true) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
    return event;
  }

  // Otherwise, always present a custom challenge
  event.response.issueTokens = false;
  event.response.failAuthentication = false;
  event.response.challengeName = "CUSTOM_CHALLENGE";
  return event;
};
