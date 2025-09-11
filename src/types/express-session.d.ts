import "express-session";
import type { UserinfoResponse } from "openid-client";

declare module "express-session" {
  interface SessionData {
    nonce?: string;
    state?: string;
    codeVerifier?: string;
    userInfo?: UserinfoResponse;
    destroy?: () => void;
  }
}
