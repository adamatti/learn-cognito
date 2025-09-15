// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/cognito-identity-provider/scenarios/cognito-developer-guide-react-example/frontend-client/src/authService.ts
import type { InitiateAuthCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClientID = process.env.COGNITO_CLIENT_ID!;
const username = process.env.USERNAME!;
const password = process.env.PASSWORD!;

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION!,
});

const testLogin = async () => {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: cognitoClientID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  // login
  const command = new InitiateAuthCommand(params);
  const { AuthenticationResult } = await cognitoClient.send(command);
  if (AuthenticationResult) {
    console.log("Got tokens", {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
      idToken: AuthenticationResult.IdToken,
    });
  }
};

(async () => {
  try {
    await testLogin();
    process.exit(0);
  } catch (error) {
    console.error("Error", { error });
  }
})();
