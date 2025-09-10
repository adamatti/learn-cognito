variable "build_tag" {
    type = string
}

variable "env_vars" {
    type        = map(string)
    sensitive   = true
}