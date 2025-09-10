resource aws_cognito_user_pool this {
    name = local.app_name
    auto_verified_attributes = ["email"]

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
    callback_urls                        = ["http://localhost:3000/api/auth/callback/cognito"]
    logout_urls                          = ["http://localhost:3000"]
    supported_identity_providers         = ["COGNITO"]
    depends_on                           = [aws_cognito_user_pool.this]
    generate_secret                      = false
}