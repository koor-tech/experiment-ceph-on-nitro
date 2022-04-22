import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const environment = process.env.ENVIRONMENT;

const commonName = `${environment}-main`;

/////////
// VPC //
/////////

const mainVPC = new aws.ec2.Vpc(
  `${commonName}-vpc`,
  { cidrBlock: "10.0.0.0/16" },
);

export const mainVPCARN = mainVPC.arn;
export const mainVPCID = mainVPC.arn;

/////////////////////
// Security Groups //
/////////////////////

// Allow DNS traffic
const allowDNSSecurityGroup = new aws.ec2.SecurityGroup(
  "allow-dns",
  {
    description: "Allow DNS traffic in/out from anywhere",
    vpcId: mainVPC.id,

    egress: [
      {
        description: "outbound DNS to anywhere",
        fromPort: 53,
        toPort: 53,
        protocol: "udp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    tags: {
      Name: commonName,
    },
  },
);

export const allowDNSSecurityGroupID = allowDNSSecurityGroup.id;

// SSH traffic
const allowSSHSecurityGroup = new aws.ec2.SecurityGroup(
  "allow-ssh",
  {
    description: "Allow SSH traffic in/out from anywhere",
    vpcId: mainVPC.id,

    ingress: [
      {
        description: "inbound SSH from anywhere",
        fromPort: 22,
        toPort: 22,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    egress: [
      {
        description: "outbound SSH to anywhere",
        fromPort: 22,
        toPort: 22,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    tags: {
      Name: commonName,
    },
  },
);

export const allowSSHSecurityGroupID = allowSSHSecurityGroup.id;

// ETCD peer traffic
const allowETCDSecurityGroup = new aws.ec2.SecurityGroup(
  "allow-etcd",
  {
    description: "Allow ETCD traffic in/out from anywhere",
    vpcId: mainVPC.id,

    ingress: [
      {
        description: "inbound ETCD from anywhere",
        fromPort: 2380,
        toPort: 2380,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    egress: [
      {
        description: "outbound ETCD to anywhere",
        fromPort: 2380,
        toPort: 2380,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    tags: {
      Name: commonName,
    },
  },
);

export const allowETCDSecurityGroupID = allowETCDSecurityGroup.id;

// Allow k0s traffic
const allowK0SSecurityGroup = new aws.ec2.SecurityGroup(
  "allow-k0s",
  {
    description: "Allow K0S traffic in/out from anywhere",
    vpcId: mainVPC.id,

    ingress: [
      {
        description: "inbound k0s apiserver from anywhere",
        fromPort: 6443,
        toPort: 6443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "inbound k0s join protocol from anywhere",
        fromPort: 9443,
        toPort: 9443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "inbound k0s konnectivity from anywhere",
        fromPort: 8132,
        toPort: 8132,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    egress: [
      {
        description: "outbound k0s apiserver from anywhere",
        fromPort: 6443,
        toPort: 6443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound k0s join protocol from anywhere",
        fromPort: 9443,
        toPort: 9443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound k0s konnectivity from anywhere",
        fromPort: 8132,
        toPort: 8132,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },
    ],

    tags: {
      Name: commonName,
    },
  },
);

export const allowK0SSecurityGroupID = allowK0SSecurityGroup.id;

/////////////
// Subnets //
/////////////

// Main Subnet
const mainSubnet = new aws.ec2.Subnet(
  `${commonName}-subnet`,
  {
    vpcId: mainVPC.id,
    cidrBlock: "10.0.1.0/24",
    mapPublicIpOnLaunch: true,
    tags: {
      Name: commonName,
    },
  },
);

export const mainSubnetID = mainSubnet.id;
