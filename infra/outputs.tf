output "api_url" {
  description = "Base URL for API Gateway stage."

  value = aws_apigatewayv2_stage.lambda.invoke_url
}

output "api_gateway_stage" {
  value = aws_apigatewayv2_stage.lambda.name
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.this.id
}
