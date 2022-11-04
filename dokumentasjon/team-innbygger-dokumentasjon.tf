# Replace APP_NAME with a descriptive name of your app

# Prod version
module "team-innbygger-dokumentasjon-prod" {
  # Name for your app. This is used for all required services created
  name = "team-innbygger-dokumentasjon-prod"
  # The host name used to reach the proxy
  proxy_hostname = "aap-team-innbygger.intern.nav.no"
  # The upstream (server) the application run on
  upstream = local.intern_nav_no_gcp

  // Don't edit
  parent_metadata = var.parent_metadata
  source          = "./proxy"
}
