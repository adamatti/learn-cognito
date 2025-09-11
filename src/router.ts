import { type Request, type Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { generators, Issuer } from "openid-client";
import config from "./config";
import logger from "./logger";

const router = Router();

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

const loginHandler = ({
  provider = "Cognito",
}: {
  provider: "Google" | "Cognito";
}) => {
  return async (req: Request, res: Response) => {
    const nonce = generators.nonce();
    const state = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    req.session.nonce = nonce;
    req.session.state = state;
    req.session.codeVerifier = codeVerifier;

    const client = await clientPromise;
    const authUrl = client.authorizationUrl({
      scope: "email openid profile",
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      ...(provider === "Google"
        ? {
            identity_provider: "Google",
          }
        : {}),
    });

    logger.info("Redirecting (login)", { url: authUrl });

    res.redirect(authUrl);
  };
};

const debugHandler = (req: Request, res: Response) => {
  res
    .json({
      session: req.session,
      request: {
        method: req.method,
        path: req.path,
        url: req.url,
        headers: req.headers,
        bodyIsBuffer: Buffer.isBuffer(req.body),
        body: Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body,
      },
    })
    .end();
};

router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World",
    isAuthenticated: !!(req.session as any).userInfo,
  });
});

/**
 * Debug route. Used for testing the session and the token.
 */
router.all("/debug", debugHandler);

/**
 * Serves as the callback URL for cognito. It sets the token and user info in the session.
 */
router.get("/callback", async (req: Request, res: Response) => {
  logger.debug("Callback called");
  const client = await clientPromise;
  const params = client.callbackParams(req);
  const tokenSet = await client.callback(`${config.apiUrl}/callback`, params, {
    nonce: req.session.nonce,
    state: req.session.state,
    code_verifier: req.session.codeVerifier,
  });
  logger.debug("Token set", { tokenSet });

  const userInfo = await client.userinfo(tokenSet.access_token!);
  req.session.userInfo = userInfo;

  res.redirect(`/${config.apiStage}`);
});

/**
 * Destroy sessions (local and on cognito)
 */
router.get("/logout", (req, res) => {
  logger.debug("Logging called");
  req.session.destroy();
  const logoutUrl = `https://${config.cognito.domainName}.auth.${config.aws.region}.amazoncognito.com/logout?client_id=${config.cognito.clientId}&logout_uri=${config.apiUrl}`;
  logger.debug("Redirecting (logout)", { url: logoutUrl });
  res.redirect(logoutUrl);
});

/**
 * Login route. Just builds the auth URL and redirects to cognito.
 */
router.all("/login", loginHandler({ provider: "Cognito" }));
router.all("/login/google", loginHandler({ provider: "Google" }));

/**
 * This is to simulate a backend call in a different system, receiving only the token
 */
router.get("/protected", async (req: Request, res: Response) => {
  const client = await clientPromise;
  if (!req.headers.authorization) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
  const token: string = req.headers.authorization?.split(" ")[1];

  const userInfo = await client.userinfo(token);

  return res.json({
    userInfo,
  });
});

export default router;
