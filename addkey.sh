
#!/usr/bin/env bash
set -euo pipefail

KEY_URL="https://github.com/SimonSeider.keys"
SSH_DIR="$HOME/.ssh"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

# in case ssh isnt set up yet create the dirs
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# same for the file
touch "$AUTHORIZED_KEYS"
chmod 600 "$AUTHORIZED_KEYS"

# download public key
KEYS=$(curl -fsSL "$KEY_URL")

if [[ -z "$KEYS" ]]; then
    echo "Error: No SSH keys found."
    exit 1
fi

# Add keys without duplicates
while IFS= read -r KEY; do
    [[ -z "$KEY" ]] && continue

    if ! grep -qxF "$KEY" "$AUTHORIZED_KEYS"; then
        echo "$KEY" >> "$AUTHORIZED_KEYS"
        echo "Added SSH key."
    else
        echo "SSH key already exists."
    fi
done <<< "$KEYS"

echo "SSH authorized_keys updated successfully."
