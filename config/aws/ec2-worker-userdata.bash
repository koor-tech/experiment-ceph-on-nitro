#!/bin/bash

# Basic hardening
sed -i -E 's/#?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?PermitEmptyPasswords yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config
sed -i -E 's/#?ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?KerberosAuthentication yes/KerberosAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?GSSAPIAuthentication yes/GSSAPIAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config

# Newer versions of OpenSSH do not allow RSA keys
echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config
echo "AuthorizedKeysFile .ssh/authorized_keys" >> /etc/ssh/sshd_config
echo "PubkeyAcceptedAlgorithms +ssh-rsa,ssh-rsa-cert-v01@openssh.com" >> /etc/ssh/sshd_config

# Restart sshd
systemctl resart sshd

## Fail2ban
apt get install fail2ban

## UFW
apt get install ufw
ufw default deny outgoing
ufw default deny incoming

ufw allow out 53 # DNS
ufw allow 22 # SSH
ufw allow 80 # HTTP
ufw allow 443 # HTTPS

ufw allow 8132 # konnectivity
ufw allow 179 # BGP
ufw allow 10250 # Kubelet API
