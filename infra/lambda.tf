resource "aws_lambda_function" "this" {
    function_name = "${local.app_name}-lambda"
    handler       = "lambda.handler"
    runtime       = "nodejs22.x"
    s3_bucket     = data.aws_s3_bucket.bucket.id
    s3_key        = "build/lambda-${var.build_tag}.zip"
    role          = aws_iam_role.lambda.arn
    memory_size   = 256
    timeout       = 10

    environment {
        variables = merge({
          NODE_OPTIONS        = "--enable-source-maps --stack-trace-limit=100"
          COGNITO_CLIENT_ID   = aws_cognito_user_pool_client.this.id
          COGNITO_POOL_ID     = aws_cognito_user_pool.this.id
          COGNITO_DOMAIN_NAME = aws_cognito_user_pool_domain.this.domain
          API_GATEWAY_STAGE   = aws_apigatewayv2_stage.lambda.name
          API_URL             = aws_apigatewayv2_stage.lambda.invoke_url
          // QUEUE_URL         = aws_sqs_queue.this.url
        }, var.env_vars)
    }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 3
}

# Allow Cognito User Pool to invoke the Lambda for triggers (e.g., PreSignUp, PostConfirmation)
resource "aws_lambda_permission" "allow_cognito_invoke" {
  statement_id  = "AllowExecutionFromCognitoUserPool"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}
