import { type Request, type Response, Router } from "express";
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
    client_secret: config.session.secret,
    redirect_uris: [`${config.apiUrl}/debug`],
    response_types: ["code"],
  });
})();

const debugHandler = (req: Request, res: Response) => {
  res
    .json({
      session: req.session,
      userInfo: (req.session as any)?.userInfo,
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

router.get("/", (_req: Request, res: Response) => {
  res.send("Hello World");
});

router.all("/debug", debugHandler);

router.get("/logout", (req, res) => {
  logger.debug("Logging called");
  (req.session as any).destroy();
  const logoutUrl = `https://${config.cognito.domainName}.auth.${config.aws.region}.amazoncognito.com/logout?client_id=${config.cognito.clientId}&logout_uri=${config.apiUrl}`;
  logger.debug("Redirecting (logout)", { url: logoutUrl });
  res.redirect(logoutUrl);
});

router.all("/login", async (req: Request, res: Response) => {
  const nonce = generators.nonce();
  const state = generators.state();

  const session = req.session as any;
  session.nonce = nonce;
  session.state = state;

  const client = await clientPromise;
  const authUrl = client.authorizationUrl({
    scope: "email openid profile",
    state,
    nonce,
  });

  logger.info("Redirecting (login)", { url: authUrl });

  res.redirect(authUrl);
});

export default router;
