import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const environment = process.env.ENVIRONMENT;

const commonName = `${environment}-main`;

const config = new pulumi.Config();
const ec2AvailabilityZone = config.require("ec2-az");

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

// Security group for controllers
const ctrlSecurityGroup = new aws.ec2.SecurityGroup(
  "k0s-ctrl",
  {
    description: "Ingress/Egress rules for k0s controllers",
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

      {
        description: "inbound ETCD from anywhere",
        fromPort: 2380,
        toPort: 2380,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

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
        description: "outbound DNS to anywhere",
        fromPort: 53,
        toPort: 53,
        protocol: "udp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound HTTP to anywhere",
        fromPort: 80,
        toPort: 80,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound HTTPS to anywhere",
        fromPort: 443,
        toPort: 443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound SSH to anywhere",
        fromPort: 22,
        toPort: 22,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound ETCD to anywhere",
        fromPort: 2380,
        toPort: 2380,
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

    ],

    tags: {
      Name: "k0s-ctrl",
    },

  },
);

export const ctrlSecurityGroupID = ctrlSecurityGroup.id;

// Security group for controllers
const workerSecurityGroup = new aws.ec2.SecurityGroup(
  "k0s-worker",
  {
    description: "Ingress/Egress rules for k0s workers",
    vpcId: mainVPC.id,

    ingress: [
      {
        description: "incoming SSH from anywhere",
        fromPort: 22,
        toPort: 22,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "incoming HTTP from anywhere",
        fromPort: 80,
        toPort: 80,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "incoming HTTPS from anywhere",
        fromPort: 443,
        toPort: 443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

    ],

    egress: [

      {
        description: "outbound DNS to anywhere",
        fromPort: 53,
        toPort: 53,
        protocol: "udp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound HTTP to anywhere",
        fromPort: 80,
        toPort: 80,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound HTTPS to anywhere",
        fromPort: 443,
        toPort: 443,
        protocol: "tcp",
        cidrBlocks: [ "0.0.0.0/0" ],
        ipv6CidrBlocks: [ "0.0.0.0/0" ],
      },

      {
        description: "outbound SSH to anywhere",
        fromPort: 22,
        toPort: 22,
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
      Name: "k0s-worker",
    },

  },
);

export const workerSecurityGroupID = workerSecurityGroup.id;

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
    availabilityZone: ec2AvailabilityZone,

    tags: {
      Name: `${commonName}-subnet`,
    },
  },
  { deleteBeforeReplace: true },
);

export const mainSubnetID = mainSubnet.id;
export const mainSubnetAZ = mainSubnet.availabilityZone;

///////////////////////
// Internet Gateways //
///////////////////////

const mainIGW = new aws.ec2.InternetGateway(
  `${commonName}-igw`,
  {
    vpcId: mainVPC.id,
    tags: {
      Name: `${commonName}-igw`,
    },
  },
);

const route = new aws.ec2.Route(
  `${commonName}-igw-route`,
  {
    routeTableId: mainVPC.mainRouteTableId,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: mainIGW.id,
  },
);
