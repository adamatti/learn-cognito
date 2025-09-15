// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/cognito-identity-provider/scenarios/cognito-developer-guide-react-example/frontend-client/src/authService.ts
import type { ConfirmSignUpCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClientID = process.env.COGNITO_CLIENT_ID!;
const username = process.env.USERNAME!;
const confirmationCode = process.env.CONFIRMATION_CODE!;

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION!,
});

const testConfirmSignUp = async () => {
  const params: ConfirmSignUpCommandInput = {
    ClientId: cognitoClientID,
    Username: username,
    ConfirmationCode: confirmationCode,
  };
  const command = new ConfirmSignUpCommand(params);
  await cognitoClient.send(command);
  console.log("User confirmed successfully");
};

(async () => {
  try {
    await testConfirmSignUp();
    process.exit(0);
  } catch (error) {
    console.error("Error", { error });
  }
})();
