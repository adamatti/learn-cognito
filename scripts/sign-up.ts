// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/cognito-identity-provider/scenarios/cognito-developer-guide-react-example/frontend-client/src/authService.ts
import type { SignUpCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClientID = process.env.COGNITO_CLIENT_ID!;
const username = process.env.USERNAME!;
const password = process.env.PASSWORD!;

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION!,
});

const testSignUp = async () => {
  const params: SignUpCommandInput = {
    ClientId: cognitoClientID,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: username,
      },
    ],
  };

  const command = new SignUpCommand(params);
  const response = await cognitoClient.send(command);
  console.log("Sign up success: ", response);
};

(async () => {
  try {
    await testSignUp();
    process.exit(0);
  } catch (error) {
    console.error("Error", { error });
  }
})();
