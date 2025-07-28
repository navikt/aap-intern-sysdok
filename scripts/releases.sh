#!/bin/bash

# List of repositories in the format "owner/repo"
REPOSITORIES=(
    "navikt/aap-behandlingsflyt"
    "navikt/aap-tilgang"
    "navikt/aap-postmottak-backend"
    "navikt/aap-kelvin-komponenter"
    "navikt/aap-oppgave"
    "navikt/aap-utbetal"
)

# Function to get the latest release of a repository
get_latest_release() {
    local repo=$1
    local latest_release=$(gh release list --repo "$repo" --limit 1 --json tagName --jq '.[0].tagName' 2>/dev/null)

    if [ -z "$latest_release" ]; then
        echo "No releases found for $repo"
    else
        echo "$repo: $latest_release"
    fi
}

# Loop through repositories
for repo in "${REPOSITORIES[@]}"; do
    get_latest_release "$repo"
done
