#!/bin/bash

# Basic hardening
sed -i -E 's/#?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?PermitEmptyPasswords yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config
sed -i -E 's/#?ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?KerberosAuthentication yes/KerberosAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?GSSAPIAuthentication yes/GSSAPIAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config

## Fail2ban
apt get install fail2ban

## UFW
apt get install ufw
ufw default deny outgoing
ufw default deny incoming

ufw allow out 53 # DNS
ufw allow 22 # SSH

ufw allow 2380 # ETCD peers

ufw allow 6443 # apiserver
ufw allow 9443 # k0s controller join API
ufw allow 8132 # konnectivity