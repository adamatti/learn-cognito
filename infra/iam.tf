resource "aws_iam_role" "lambda" {
  name = "${local.app_name}-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service : "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "log" {
  name = "LogPermission"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ]
          Effect = "Allow"
          Resource = [
            "arn:aws:logs:*:*:*"
          ]
        }
      ]
    })
}

resource "aws_iam_role_policy" "s3" {
  name = "S3ReadPermission"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        {
          Action = [
            "s3:Get*",
            "s3:List*",
            "s3:Describe*",
            "s3-object-lambda:Get*",
            "s3-object-lambda:List*"
          ]
          Effect = "Allow"
          Resource = [
            data.aws_s3_bucket.bucket.arn,
            "${data.aws_s3_bucket.bucket.arn}/*"
          ]
        },
      ]
  })
}

resource "aws_iam_role_policy" "cognito" {
  name = "CognitoPermission"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "cognito-idp:AdminGetUser"
  
        ]
        Effect = "Allow"
        Resource = "*"
      }
    ]
  })
}