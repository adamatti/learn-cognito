
// workarround to avoid circular dependency
/*
data "aws_lambda_function" "lambda" {
    function_name = "${local.app_name}-lambda"
} */

resource aws_cognito_user_pool this {
    name = local.app_name
    auto_verified_attributes = ["email"]
    username_attributes      = ["email"]

    admin_create_user_config {
        allow_admin_create_user_only = false
    }

    password_policy {
        minimum_length                   = 8
        require_uppercase                = true
        require_lowercase                = true
        require_numbers                  = true
        require_symbols                  = true
        temporary_password_validity_days = 14
    }

    // lambda_config {
        //custom_email_sender {
        //    lambda_arn     = data.aws_lambda_function.lambda.arn
        //    lambda_version = data.aws_lambda_function.lambda.version
        //}

        // pre_sign_up = data.aws_lambda_function.lambda.arn
        // post_authentication = data.aws_lambda_function.lambda.arn
        // post_confirmation = data.aws_lambda_function.lambda.arn
        // pre_authentication = data.aws_lambda_function.lambda.arn
        // pre_token_generation = data.aws_lambda_function.lambda.arn
    // }
}

 resource aws_cognito_user_pool_domain this {
  domain       = "learn-adamatti" // local.app_name // cognito is not allowed here
  user_pool_id = aws_cognito_user_pool.this.id
}

resource aws_cognito_user_pool_client this {
    name = local.app_name
    user_pool_id = aws_cognito_user_pool.this.id
    allowed_oauth_flows                  = ["code"]
    allowed_oauth_scopes                 = ["email", "openid", "profile"]
    allowed_oauth_flows_user_pool_client = true
    explicit_auth_flows                  = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH"]
    callback_urls                        = [
        // "http://localhost:3000/api/auth/callback/cognito",
        "${aws_apigatewayv2_stage.lambda.invoke_url}/callback",
        // "${aws_apigatewayv2_stage.lambda.invoke_url}/debug"
    ]
    logout_urls                          = [
        // "http://localhost:3000",
        aws_apigatewayv2_stage.lambda.invoke_url,
        // "${aws_apigatewayv2_stage.lambda.invoke_url}/debug"
    ]
    supported_identity_providers         = ["COGNITO", "Google"]
    depends_on                           = [aws_cognito_user_pool.this]
    generate_secret                      = false
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.this.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "openid profile email"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret

    // These are needed for google - to avoid diffs on each tf apply/plan
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

