import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import type { Request, Response } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Issuer } from "openid-client";
import config from "../config";
import logger from "../logger";

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.aws.region,
});

// FIXME for now it is duplicated
const clientPromise = (async function initializeClient() {
  const issuer = await Issuer.discover(
    `https://cognito-idp.${config.aws.region}.amazonaws.com/${config.cognito.poolId}`
  );
  return new issuer.Client({
    client_id: config.cognito.clientId,

    // client_secret: config.session.secret,
    token_endpoint_auth_method: "none",

    redirect_uris: [`${config.apiUrl}/callback`],
    response_types: ["code"],
  });
})();

const router = Router();

/**
 * Magic link: request link. No email is sent here (user will handle).
 * Starts CUSTOM_AUTH and stores the Cognito Session in express-session.
 */
router.post("/magic/request", async (req: Request, res: Response) => {
  try {
    const email: string | undefined =
      req.body?.email ?? (req.query?.email as string | undefined);
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "email is required" });
    }

    const init = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "CUSTOM_AUTH",
        ClientId: config.cognito.clientId,
        AuthParameters: {
          USERNAME: email,
        },
      })
    );

    req.session.cognitoSession = init.Session;
    req.session.magicEmail = email;

    // The trigger Lambda will send or otherwise deliver the code/link.
    return res.json({ message: "Magic link requested" });
  } catch (error) {
    logger.error("Magic request error", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "error" });
  }
});

/**
 * Magic link: callback with otp. Completes the CUSTOM_CHALLENGE and logs the user in.
 */
router.get("/magic/callback", async (req: Request, res: Response) => {
  try {
    const otp: string | undefined =
      (req.query?.otp as string) ?? (req.body as any)?.otp;
    const email = req.session.magicEmail;
    const session = req.session.cognitoSession;
    if (!(otp && email && session)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "otp/email/session missing" });
    }

    const resp = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ClientId: config.cognito.clientId,
        ChallengeName: "CUSTOM_CHALLENGE",
        Session: session,
        ChallengeResponses: {
          USERNAME: email,
          ANSWER: otp,
        },
      })
    );

    if (!resp.AuthenticationResult?.AccessToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "invalid code" });
    }

    const client = await clientPromise;
    const userInfo = await client.userinfo(
      resp.AuthenticationResult.AccessToken
    );
    req.session.userInfo = userInfo;

    // cleanup
    req.session.cognitoSession = undefined;
    req.session.magicEmail = undefined;

    return res.redirect(`/${config.apiStage}`);
  } catch (error) {
    logger.error("Magic callback error", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "error" });
  }
});

export default router;
