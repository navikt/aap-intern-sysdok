#!/bin/bash

# GitHub Pull Requests Fetcher using GitHub CLI
#
# This script fetches all open pull requests for a list of GitHub repositories.
# Requires: GitHub CLI (gh) - https://cli.github.com/
#
# Usage:
#   ./github_pr_fetcher.sh
#   ./github_pr_fetcher.sh --output json
#   ./github_pr_fetcher.sh --repos "owner/repo1,owner/repo2"
#   ./github_pr_fetcher.sh --help

set -euo pipefail

# Default configuration
DEFAULT_REPOS=(
  "navikt/aap-behandlingsflyt"
  "navikt/aap-api"
  "navikt/aap-saksbehandling"
  "navikt/aap-soknad"
  "navikt/aap-tilgang"
  "navikt/aap-statistikk"
  "navikt/aap-innsending"
  "navikt/aap-utbetal"
  "navikt/aap-api-intern"
  "navikt/aap-kelvin-komponenter"
  "navikt/aap-brev-sanity-proxy"
  "navikt/aap-meldekort-backend"
  "navikt/aap-intern-sysdok"
  "navikt/aap-oppslag"
  "navikt/aap-sanity-brev"
  "navikt/aap-sanity-proxy"
)

OUTPUT_FORMAT="table"
REPOS=()
OUTPUT_FILE=""
SHOW_DRAFTS=true
LIMIT=100

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to show help
show_help() {
    cat << EOF
GitHub Pull Requests Fetcher

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -r, --repos REPOS           Comma-separated list of repositories (owner/repo format)
    -o, --output FORMAT         Output format: table, json, csv (default: table)
    -f, --file FILE             Save output to file
    -l, --limit NUMBER          Limit number of PRs per repository (default: 100)
    --no-drafts                 Exclude draft pull requests
    -h, --help                  Show this help message

EXAMPLES:
    $0
    $0 --output json --file prs.json
    $0 --repos "facebook/react,microsoft/vscode"
    $0 --limit 50 --no-drafts

REQUIREMENTS:
    - GitHub CLI (gh) must be installed and authenticated
    - Run 'gh auth login' to authenticate

EOF
}

# Function to check if gh CLI is installed and authenticated
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_color $RED "Error: GitHub CLI (gh) is not installed."
        print_color $YELLOW "Install it from: https://cli.github.com/"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        print_color $RED "Error: GitHub CLI is not authenticated."
        print_color $YELLOW "Run 'gh auth login' to authenticate."
        exit 1
    fi
}

# Function to validate repository format
validate_repo() {
    local repo=$1
    if [[ ! $repo =~ ^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$ ]]; then
        print_color $RED "Error: Invalid repository format '$repo'. Use 'owner/repo' format."
        return 1
    fi
    return 0
}

# Function to fetch PRs for a single repository
fetch_repo_prs() {
    local repo=$1
    local temp_file=$(mktemp)
    
    print_color $BLUE "Fetching PRs for $repo..." >&2
    
    local gh_cmd="gh pr list --repo $repo --state open --limit $LIMIT"
    
    if [[ $SHOW_DRAFTS == false ]]; then
        gh_cmd="$gh_cmd --search '-is:draft'"
    fi
    
    case $OUTPUT_FORMAT in
        "json")
            if $gh_cmd --json number,title,author,createdAt,updatedAt,url,isDraft,labels,baseRefName,headRefName,mergeable > "$temp_file" 2>/dev/null; then
                :
            else
                echo "[]" > "$temp_file"
            fi
            ;;
        "csv")
            echo "repository,number,title,author,created_at,updated_at,url,is_draft,labels,base_branch,head_branch" > "$temp_file"
            if $gh_cmd --json number,title,author,createdAt,updatedAt,url,isDraft,labels,baseRefName,headRefName 2>/dev/null | \
            jq -r --arg repo "$repo" '.[] | [$repo, .number, .title, .author.login, .createdAt, .updatedAt, .url, .isDraft, (.labels | map(.name) | join(";")), .baseRefName, .headRefName] | @csv' >> "$temp_file" 2>/dev/null; then
                :
            fi
            ;;
        *)
            echo "Repository: $repo" > "$temp_file"
            if $gh_cmd >> "$temp_file" 2>/dev/null; then
                echo "" >> "$temp_file"
            fi
            ;;
    esac
    
    local pr_count=0
    if [[ $OUTPUT_FORMAT == "json" ]]; then
        pr_count=$(jq length "$temp_file" 2>/dev/null || echo "0")
    elif [[ $OUTPUT_FORMAT == "csv" ]]; then
        pr_count=$(($(wc -l < "$temp_file") - 1))
        if [[ $pr_count -lt 0 ]]; then
            pr_count=0
        fi
    else
        pr_count=$(grep -c "^[0-9]" "$temp_file" 2>/dev/null || echo "0")
    fi
    
    print_color $GREEN "Found $pr_count open PRs in $repo" >&2
    
    echo "$temp_file"
}

# Function to merge JSON files
merge_json_files() {
    local files=("$@")
    local merged_data="[]"
    
    for file in "${files[@]}"; do
        if [[ -s "$file" ]]; then
            local repo_data=$(cat "$file")
            merged_data=$(echo "$merged_data" | jq --argjson new "$repo_data" '. + $new')
        fi
    done
    
    echo "$merged_data"
}

# Function to merge CSV files
merge_csv_files() {
    local files=("$@")
    local first_file=true
    
    for file in "${files[@]}"; do
        if [[ -s "$file" ]]; then
            if [[ $first_file == true ]]; then
                cat "$file"
                first_file=false
            else
                tail -n +2 "$file"
            fi
        fi
    done
}

# Function to generate summary
generate_summary() {
    local total_prs=$1
    local repo_count=$2
    
    print_color $YELLOW "\n=== SUMMARY ==="
    print_color $GREEN "Total open pull requests: $total_prs"
    print_color $GREEN "Repositories checked: $repo_count"
    
    if [[ $OUTPUT_FILE ]]; then
        print_color $BLUE "Output saved to: $OUTPUT_FILE"
    fi
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -r|--repos)
                IFS=',' read -ra REPOS <<< "$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_FORMAT=$2
                shift 2
                ;;
            -f|--file)
                OUTPUT_FILE=$2
                shift 2
                ;;
            -l|--limit)
                LIMIT=$2
                shift 2
                ;;
            --no-drafts)
                SHOW_DRAFTS=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_color $RED "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Use default repos if none specified
    if [[ ${#REPOS[@]} -eq 0 ]]; then
        REPOS=("${DEFAULT_REPOS[@]}")
    fi
    
    # Validate output format
    if [[ ! $OUTPUT_FORMAT =~ ^(table|json|csv)$ ]]; then
        print_color $RED "Error: Invalid output format '$OUTPUT_FORMAT'. Use: table, json, or csv"
        exit 1
    fi
}

# Main function
main() {
    parse_args "$@"
    check_gh_cli
    
    print_color $BLUE "Starting GitHub PR fetch for ${#REPOS[@]} repositories..."
    print_color $BLUE "Output format: $OUTPUT_FORMAT"
    
    local temp_files=()
    local total_prs=0
    
    # Fetch PRs for each repository
    for repo in "${REPOS[@]}"; do
        if validate_repo "$repo"; then
            temp_file=$(fetch_repo_prs "$repo")
            if [[ -f "$temp_file" ]]; then
                temp_files+=("$temp_file")
            fi
        fi
    done
    
    # Combine results based on output format
    if [[ ${#temp_files[@]} -gt 0 ]]; then
        case $OUTPUT_FORMAT in
            "json")
                output=$(merge_json_files "${temp_files[@]}")
                total_prs=$(echo "$output" | jq length)
                ;;
            "csv")
                output=$(merge_csv_files "${temp_files[@]}")
                total_prs=$(($(echo "$output" | wc -l) - 1))
                ;;
            *)
                output=$(cat "${temp_files[@]}")
                total_prs=$(echo "$output" | grep -c "^[0-9]" || echo "0")
                ;;
        esac
        
        # Output results
        if [[ $OUTPUT_FILE ]]; then
            echo "$output" > "$OUTPUT_FILE"
        else
            echo "$output"
        fi
        
        # Generate summary
        generate_summary "$total_prs" "${#REPOS[@]}"
    fi
    
    # Cleanup temp files
    for temp_file in "${temp_files[@]}"; do
        rm -f "$temp_file"
    done
}

# Run main function with all arguments
main "$@"
