variable "build_tag" {
    type = string
}

variable "env_vars" {
    type        = map(string)
    sensitive   = true
}

variable "google_client_id" {
    type      = string
    sensitive = true
}

variable "google_client_secret" {
    type      = string
    sensitive = true
}