# 🔧 SSH Connection Troubleshooting Guide

This guide helps resolve SSH connection issues in the CI/CD pipeline for deploying to your VPS.

## 🚨 Common Error: "Permission denied (publickey,password)"

This error typically occurs when:
1. SSH private key doesn't match the public key on the server
2. SSH key format is incorrect
3. SSH user doesn't have proper permissions
4. Server configuration issues

## 🔍 Debugging Steps

### Step 1: Validate SSH Key Format

The SSH private key must be in the correct format. Common issues:

**✅ Correct format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

**❌ Common issues:**
- Extra whitespace or newlines
- Windows line endings (CRLF instead of LF)
- Missing header/footer lines
- Corrupted key content

### Step 2: Verify SSH Key on Server

On your VPS, check that the public key is properly installed:

```bash
# Check if the public key exists
cat ~/.ssh/authorized_keys

# Check SSH directory permissions
ls -la ~/.ssh/
# Should show: drwx------ (700) for .ssh directory
# Should show: -rw------- (600) for authorized_keys file

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Test SSH Connection Locally

Before running the pipeline, test SSH connection from your local machine:

```bash
# Test with verbose output
ssh -v -i /path/to/your/private/key ec2-user@vps-73.fds-1.com

# Test with specific options
ssh -o ConnectTimeout=30 -o BatchMode=yes -o StrictHostKeyChecking=no -i /path/to/your/private/key ec2-user@vps-73.fds-1.com "echo 'Connection successful'"
```

## 🔧 Pipeline Fixes Applied

### 1. Enhanced SSH Key Handling

The updated action now:
- Removes Windows line endings (`\r`)
- Validates SSH key format using `ssh-keygen -l`
- Attempts to fix common formatting issues
- Sets proper file permissions (600 for private key, 644 for known_hosts)

### 2. Improved Error Diagnostics

The action provides:
- SSH key fingerprint for verification
- Verbose SSH connection output
- Network connectivity tests
- Fallback connection methods

### 3. Better SSH Configuration

The SSH config now includes:
- `StrictHostKeyChecking no` - Skip host key verification
- `UserKnownHostsFile /dev/null` - Don't save host keys
- `LogLevel ERROR` - Reduce verbose output
- `ConnectTimeout=30` - Reasonable timeout
- `BatchMode=yes` - Non-interactive mode

## 🛠️ Manual Fixes

### Fix 1: Regenerate SSH Key Pair

If the key is corrupted, generate a new one:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/vps_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/vps_key.pub ec2-user@vps-73.fds-1.com

# Test connection
ssh -i ~/.ssh/vps_key ec2-user@vps-73.fds-1.com
```

### Fix 2: Update GitHub Secrets

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Update `CREAMAT_SSH_PRIVATE_KEY` with the new private key content
4. Ensure the key includes the header and footer lines

### Fix 3: Server-side SSH Configuration

On your VPS, check SSH server configuration:

```bash
# Check SSH server config
sudo cat /etc/ssh/sshd_config

# Important settings:
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
# PasswordAuthentication no (recommended)
# PermitRootLogin no (recommended)

# Restart SSH service if changes made
sudo systemctl restart sshd
```

### Fix 4: User and Group Permissions

Ensure the SSH user has proper permissions:

```bash
# Check user exists
id ec2-user

# Check home directory permissions
ls -la /home/ec2-user/
# Should show: drwxr-xr-x ec2-user ec2-user

# Fix if needed
sudo chown -R ec2-user:ec2-user /home/ec2-user/.ssh
```

## 🧪 Testing the Fix

### Use the Test Action

We've created a test action to validate SSH connectivity:

```yaml
- name: Test SSH Connection
  uses: ./.github/actions/test-ssh-connection
  with:
    ssh-private-key: ${{ secrets.CREAMAT_SSH_PRIVATE_KEY }}
    server-hostname: ${{ inputs.server }}
    server-user: ${{ inputs.ssh_option }}
```

### Manual Pipeline Test

1. Trigger the deployment workflow manually
2. Check the "Setup SSH Connection via Cloudflare" step logs
3. Look for specific error messages and SSH key fingerprint
4. Compare fingerprint with your local key: `ssh-keygen -l -f ~/.ssh/your_key`

## 🔐 Cloudflare Tunnel Configuration

If using Cloudflare tunnel, ensure:

### 1. Service Token is Valid

Check that your Cloudflare service tokens are:
- Not expired
- Have proper permissions for SSH access
- Correctly stored in GitHub secrets

### 2. Tunnel Configuration

The tunnel should be configured to allow SSH access:
- Tunnel must be running on the server
- SSH service must be accessible through the tunnel
- Proper authentication method configured

### 3. Fallback to Direct SSH

The updated action includes fallback to direct SSH if Cloudflare tunnel fails:

```bash
# If Cloudflare tunnel fails, try direct connection
ssh -v -o ConnectTimeout=30 -o BatchMode=yes ec2-user@vps-73.fds-1.com
```

## 📋 Checklist for SSH Issues

Before running the pipeline, verify:

- [ ] SSH private key is in correct OpenSSH format
- [ ] Public key is installed on the server in `~/.ssh/authorized_keys`
- [ ] SSH directory permissions are correct (700 for .ssh, 600 for authorized_keys)
- [ ] SSH user exists and has proper permissions
- [ ] SSH service is running on the server
- [ ] Port 22 is accessible (not blocked by firewall)
- [ ] GitHub secrets are correctly configured
- [ ] Server hostname resolves correctly

## 🆘 Getting Help

If issues persist:

1. **Check Pipeline Logs**: Look for specific error messages in the GitHub Actions logs
2. **Test Locally**: Always test SSH connection from your local machine first
3. **Verify Server**: Log into the server directly and check SSH configuration
4. **Check Firewall**: Ensure no firewall rules are blocking SSH access
5. **Contact Support**: If using a managed VPS, contact your provider's support

## 🔄 Quick Fix Commands

```bash
# On your VPS - fix common SSH issues
sudo chmod 700 /home/ec2-user/.ssh
sudo chmod 600 /home/ec2-user/.ssh/authorized_keys
sudo chown -R ec2-user:ec2-user /home/ec2-user/.ssh
sudo systemctl restart sshd

# Test from local machine
ssh -v -o ConnectTimeout=30 ec2-user@vps-73.fds-1.com "echo 'Connection test successful'"
```

This troubleshooting guide should help resolve most SSH connection issues in your CI/CD pipeline.
