#!/bin/bash

# Basic hardening
sed -i -E 's/#?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?PermitEmptyPasswords yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config
sed -i -E 's/#?ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?KerberosAuthentication yes/KerberosAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?GSSAPIAuthentication yes/GSSAPIAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/#?X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config
sed -i -E 's/#?KbdInteractiveAuthentication no/KbdInteractiveAuthentication yes/' /etc/ssh/sshd_config

# Newer versions of OpenSSH do not allow RSA keys
echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config
echo "AuthorizedKeysFile .ssh/authorized_keys" >> /etc/ssh/sshd_config
echo "PubkeyAcceptedAlgorithms +ssh-rsa,ssh-rsa-cert-v01@openssh.com" >> /etc/ssh/sshd_config

# Update machine
apt update -y

## Fail2ban
apt install fail2ban

## UFW
apt install ufw
ufw default deny outgoing
ufw default deny incoming

ufw allow out 53 # DNS
ufw allow 22 # SSH

ufw allow 2380 # ETCD peers

ufw allow 6443 # apiserver
ufw allow 9443 # k0s controller join API
ufw allow 8132 # konnectivity

# Install cgroup tools (this enables the pid cgroup and others)
apt install -y cgroup-tools

# Create the missing pids directory to hold mounted pid information
cat <<EOF > /etc/systemd/system/create-pids-cgroup.service
[Unit]
Description=Create pids cgroup folder
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/mkdir /sys/fs/cgroup/pids
Restart=on-abort

[Install]
WantedBy=multi-user.target
EOF

# Load and enable the create pgroup service
systemctl daemon-reload
systemctl enable create-pids-cgroup.service

# Enable CGroup v1 support for rook
sed -i 's/^GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"/GRUB_CMDLINE_LINUX_DEFAULT="quiet splash systemd.unified_cgroup_hierarchy=0"/' /etc/default/grub
sed -i 's/GRUB_CMDLINE_LINUX=""/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0"/' /etc/default/grub
update-grub
grub-mkconfig -o /boot/grub/grub.cfg

################
# Rook cleanup #
################

# Delete the rook lib if it is present
rm -rf /var/lib/rook

#############
# k8s Setup #
#############

# Huge pages setup (for DB usage)
echo 2048 | tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
sysctl -w vm.nr_hugepages 2048
echo "vm.nr_hugepages=2048" >> /etc/sysctl.conf

# Reboot
systemctl reboot
