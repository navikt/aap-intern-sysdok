#!/usr/bin/env bash
set -euo pipefail

TYPST_VERSION="0.15.1"
# Hashes cover the release archives, not the extracted executables.
# https://github.com/typst/typst/releases/expanded_assets/v0.15.1
LINUX_SHA256="a6d077d0a95eed5a2eba715b2dae06be954f624ccbf85758a03f389ded33118c"
MACOS_SHA256="48f62ed034aa3a7978309579ac6ca00045e2ef0da73114e8af27cfd8e74dc05a"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
TOOLS_ROOT="$REPO_ROOT/tools/typst"
VERSION_ROOT="$TOOLS_ROOT/$TYPST_VERSION"
TARGETS=("x86_64-unknown-linux-musl" "aarch64-apple-darwin")

fail() {
    printf 'Typst: %s\n' "$*" >&2
    exit 1
}

host_target() {
    local platform
    platform="$(uname -s)/$(uname -m)"
    case "$platform" in
        Linux/x86_64) printf '%s\n' "${TARGETS[0]}" ;;
        Darwin/arm64) printf '%s\n' "${TARGETS[1]}" ;;
        *) fail "Unsupported platform: $platform. Supported: Linux x86_64 and macOS Apple Silicon." ;;
    esac
}

check_directory() {
    [[ ! -L "$1" ]] || fail "Refusing symlink directory: $1"
    if [[ -e "$1" && ! -d "$1" ]]; then
        fail "Expected a directory: $1"
    fi
}

check_install_path() {
    local directory
    for directory in "$REPO_ROOT/tools" "$TOOLS_ROOT" "$VERSION_ROOT"; do
        check_directory "$directory"
    done
}

install_typst() (
    local target expected_hash archive prefix actual_hash expected_entries entries metadata file destination
    local workdir="" lock_held=false
    local selected_targets=("$@")
    umask 077

    for file in curl tar cmp mktemp sort; do
        command -v "$file" >/dev/null || fail "Required tool not found: $file"
    done
    if ! command -v sha256sum >/dev/null && ! command -v shasum >/dev/null; then
        fail "Install sha256sum or shasum to verify downloads."
    fi

    check_install_path
    mkdir -p "$TOOLS_ROOT"
    if ! mkdir "$TOOLS_ROOT/.install.lock"; then
        fail "Installation is locked. Check for another installer or a stale $TOOLS_ROOT/.install.lock."
    fi
    lock_held=true

    cleanup() {
        if [[ -n "$workdir" ]]; then
            rm -rf -- "$workdir"
        fi
        if [[ "$lock_held" == true ]]; then
            rmdir "$TOOLS_ROOT/.install.lock"
        fi
    }
    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    trap 'exit 129' HUP

    check_install_path
    mkdir -p "$VERSION_ROOT"
    workdir="$(mktemp -d "$VERSION_ROOT/.install.XXXXXX")"

    for target in "${selected_targets[@]}"; do
        case "$target" in
            x86_64-unknown-linux-musl) expected_hash="$LINUX_SHA256" ;;
            aarch64-apple-darwin) expected_hash="$MACOS_SHA256" ;;
            *) fail "Unsupported target: $target" ;;
        esac
        archive="$workdir/$target.tar.xz"
        prefix="typst-$target"
        printf 'Downloading Typst %s for %s\n' "$TYPST_VERSION" "$target"
        curl --fail --show-error --silent --location \
            --proto '=https' --proto-redir '=https' --tlsv1.2 \
            --connect-timeout 10 --max-time 180 --max-redirs 5 \
            "https://github.com/typst/typst/releases/download/v$TYPST_VERSION/$prefix.tar.xz" \
            --output "$archive"

        if command -v sha256sum >/dev/null; then
            actual_hash="$(sha256sum "$archive")"
        else
            actual_hash="$(shasum -a 256 "$archive")"
        fi
        actual_hash="${actual_hash%% *}"
        [[ "$actual_hash" == "$expected_hash" ]] ||
            fail "Checksum mismatch for $target: expected $expected_hash, got $actual_hash."

        expected_entries="$(printf '%s\n' "$prefix/" "$prefix/typst" \
            "$prefix/LICENSE" "$prefix/NOTICE" "$prefix/README.md" | LC_ALL=C sort)"
        entries="$(tar -tJf "$archive" | LC_ALL=C sort)"
        [[ "$entries" == "$expected_entries" ]] ||
            fail "Unexpected archive entries for $target."

        for file in typst LICENSE NOTICE README.md; do
            metadata="$(LC_ALL=C tar -tvJf "$archive" "$prefix/$file")"
            [[ "${metadata:0:1}" == "-" ]] ||
                fail "Expected a regular file in the archive: $prefix/$file"
        done

        mkdir "$workdir/$target"
        # Extract to stdout so archive paths, owners and modes cannot control installation.
        for file in typst LICENSE NOTICE; do
            tar -xJOf "$archive" "$prefix/$file" > "$workdir/$target/$file"
        done
        chmod 755 "$workdir/$target" "$workdir/$target/typst"
        chmod 644 "$workdir/$target/LICENSE" "$workdir/$target/NOTICE"
    done

    # Verify every existing target before publishing any staged target.
    for target in "${selected_targets[@]}"; do
        destination="$VERSION_ROOT/$target"
        check_directory "$destination"
        if [[ -d "$destination" ]]; then
            [[ -x "$destination/typst" ]] ||
                fail "Existing Typst binary is not executable: $destination/typst"
            for file in typst LICENSE NOTICE; do
                [[ -f "$destination/$file" && ! -L "$destination/$file" ]] ||
                    fail "Expected an installed regular file: $destination/$file"
                cmp -s "$workdir/$target/$file" "$destination/$file" ||
                    fail "Existing $destination/$file differs from the release. Refusing to overwrite it."
            done
        fi
    done

    for target in "${selected_targets[@]}"; do
        destination="$VERSION_ROOT/$target"
        if [[ ! -d "$destination" ]]; then
            mv "$workdir/$target" "$destination"
        fi
        printf 'Typst %s ready: %s/typst\n' "$TYPST_VERSION" "$destination"
    done
)

if [[ "${1:-}" == install ]]; then
    case "$#" in
        1)
            target="$(host_target)"
            install_typst "$target"
            ;;
        2)
            [[ "$2" == --all ]] || fail "Usage: bash beregninger/typst.sh install [--all]"
            install_typst "${TARGETS[@]}"
            ;;
        *) fail "Usage: bash beregninger/typst.sh install [--all]" ;;
    esac
    exit 0
fi

target="$(host_target)"
check_install_path
check_directory "$VERSION_ROOT/$target"
binary="$VERSION_ROOT/$target/typst"
[[ ! -L "$binary" ]] || fail "Refusing symlink executable: $binary"
[[ -f "$binary" && -x "$binary" ]] ||
    fail "Binary missing: $binary. Run: bash \"$REPO_ROOT/beregninger/typst.sh\" install"
exec "$binary" "$@"
