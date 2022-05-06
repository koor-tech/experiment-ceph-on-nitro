import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import {
  mainSubnetID,
  mainSubnetAZ,

  ctrlSecurityGroupID,
  workerSecurityGroupID,
} from "./network";

///////////////////////////
// Setup & Configuration //
///////////////////////////

const config = new pulumi.Config();

const environment = process.env.ENVIRONMENT;
if (!environment) { throw new Error("ENV variable [ENVIRONMENT] missing"); }

const sshKeyAbsolutePath = process.env.SSH_PUB_KEY_ABS_PATH;
if (!sshKeyAbsolutePath) { throw new Error("ENV variable [SSH_PUB_KEY_ABS_PATH] missing"); }

const ctrlUserDataAbsolutePath = process.env.CONTROLLER_USERDATA_PATH;
if (!ctrlUserDataAbsolutePath) { throw new Error("ENV variable [CONTROLLER_USERDATA_PATH] missing"); }

const workerUserDataAbsolutePath = process.env.WORKER_USERDATA_PATH;
if (!workerUserDataAbsolutePath) { throw new Error("ENV variable [WORKER_USERDATA_PATH] missing"); }

let clusterOutputDirectory = process.env.CLUSTER_OUTPUT_BASE_DIR_PATH;
if (!clusterOutputDirectory) { throw new Error("ENV variable [CLUSTER_OUTPUT_BASE_DIR_PATH] missing"); }

const ec2InstanceType = config.require("ec2-instance-type");
const ec2SSHKeyName = config.require("ec2-ssh-key-name");

/////////
// AMI //
/////////

// https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
// https://cloud-images.ubuntu.com/locator/ec2/
// Ubuntu 22.04 Jammy instance (ami-0ee8244746ec5d6d4)
const ami = aws.ec2.getAmi({
  mostRecent: true,
  filters: [
    {
      name: "name",
      values: ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20220420"],
    },
    {
      name: "virtualization-type",
      values: ["hvm"],
    },
  ],
  owners: ["099720109477"],
});

/////////
// SSH //
/////////

// Only necessary when the SSH key is missing/doesn't exist
// see: https://github.com/pulumi/pulumi/issues/3388

// Normally, during operation the keypairs are added and removed
// if you run stock, *then* run nitro, you need to comment the section below.

const adminSSHKey = new aws.ec2.KeyPair(
  "admin-ssh-key",
  {
    keyName: ec2SSHKeyName,
    publicKey: fs.readFileSync(sshKeyAbsolutePath).toString()
  },
);

export const adminSSHKeyKeyName = adminSSHKey.keyName;

//////////////////
// Controller 0 //
//////////////////

const ctrl0 = new aws.ec2.Instance(
  `${environment}-ctrl-0`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: ec2SSHKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      ctrlSecurityGroupID,
    ],

    userData: fs.readFileSync(ctrlUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-ctrl-0`,
      NodeId: "ctrl-0",
      Environment: environment,
    },
  },
);

export const ctrl0PublicIPV4 = ctrl0.publicIp;
export const ctrl0PrivateIPV4 = ctrl0.privateIp;

//////////////////
// Worker nodes //
//////////////////

const worker0 = new aws.ec2.Instance(
  `${environment}-worker-0`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: ec2SSHKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    // Storage
    rootBlockDevice: {
      volumeSize: 32, // GiB
      volumeType: "gp3",
    },

    ebsBlockDevices: [
      // We need more than 170GB to get more than 128MiB/s
      // over 334 and we get 250MiB/s regardless of burst credits
      { deviceName: "/dev/sdf", volumeSize: 350, volumeType: "gp3" },
    ],

    ebsOptimized: true,

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-0`,
      WorkerId: "worker-0",
      Environment: environment,
    },
  },
);


export const worker0PublicIPV4 = worker0.publicIp;
export const worker0PrivateIPV4 = worker0.privateIp;

const worker1 = new aws.ec2.Instance(
  `${environment}-worker-1`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: ec2SSHKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    // Storage
    rootBlockDevice: {
      volumeSize: 32, // GiB
      volumeType: "gp3",
    },

    ebsBlockDevices: [
      // We need more than 170GB to get more than 128MiB/s
      // over 334 and we get 250MiB/s regardless of burst credits
      { deviceName: "/dev/sdf", volumeSize: 350, volumeType: "gp3" },
    ],

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-1`,
      WorkerId: "worker-1",
      Environment: environment,
    },
  },
);

export const worker1PublicIPV4 = worker1.publicIp;
export const worker1PrivateIPV4 = worker1.privateIp;

const worker2 = new aws.ec2.Instance(
  `${environment}-worker-2`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: ec2SSHKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    // Storage
    rootBlockDevice: {
      volumeSize: 32, // GiB
      volumeType: "gp3",
    },

    ebsBlockDevices: [
      // We need more than 170GB to get more than 128MiB/s
      // over 334 and we get 250MiB/s regardless of burst credits
      { deviceName: "/dev/sdf", volumeSize: 350, volumeType: "gp3" },
    ],

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-2`,
      WorkerId: "worker-2",
      Environment: environment,
    },
  },
);

export const worker2PublicIPV4 = worker2.publicIp;
export const worker2PrivateIPV4 = worker2.privateIp;

//////////////////
// File Outputs //
//////////////////

// Write the load balancer IP for the controllers to disk to disk
pulumi
  .all([
    ctrl0PublicIPV4,
    ctrl0PrivateIPV4,
    worker0PublicIPV4,
    worker0PrivateIPV4,
    worker1PublicIPV4,
    worker1PrivateIPV4,
    worker2PublicIPV4,
    worker2PrivateIPV4,
  ])
  .apply((args) => {

    const [
      ctrlPublicIP,
      ctrlPrivateIP,
      worker0PublicIP,
      worker0PrivateIP,
      worker1PublicIP,
      worker1PrivateIP,
      worker2PublicIP,
      worker2PrivateIP,
    ] = args;

    let filePath;

    // Build the output directory
    if (!clusterOutputDirectory) { throw new Error("Missing cluster output base directory"); }
    if (!environment) { throw new Error("Missing cluster output base directory"); }
    const outputDir = path.join(clusterOutputDirectory, environment);

    // Create the cluster output dir if it's not present
    fs.mkdirSync(outputDir, { recursive: true });
    pulumi.log.info(`writing cluster information to [${outputDir}]`);

    // Write ipv4 for ctrl 0
    fs.writeFileSync(path.join(outputDir, "ctrl-0-public-ipv4Address"), ctrlPublicIP);
    fs.writeFileSync(path.join(outputDir, "ctrl-0-private-ipv4Address"), ctrlPrivateIP);
    pulumi.log.info("successfuly wrote controller ctrl-0 IPv4 addresses");

    // Write ipv4 for worker 0
    fs.writeFileSync(path.join(outputDir, "worker-0-public-ipv4Address"), worker0PublicIP);
    fs.writeFileSync(path.join(outputDir, "worker-0-private-ipv4Address"), worker0PrivateIP);
    pulumi.log.info("successfuly wrote worker 0 IPv4 addresses");

    // Write ipv4 for worker 1
    fs.writeFileSync(path.join(outputDir, "worker-1-public-ipv4Address"), worker1PublicIP);
    fs.writeFileSync(path.join(outputDir, "worker-1-private-ipv4Address"), worker1PrivateIP);
    pulumi.log.info("successfuly wrote worker 1 IPv4 addresses");

    // Write ipv4 for worker 2
    fs.writeFileSync(path.join(outputDir, "worker-2-public-ipv4Address"), worker2PublicIP);
    fs.writeFileSync(path.join(outputDir, "worker-2-private-ipv4Address"), worker2PrivateIP);
    pulumi.log.info("successfuly wrote worker 2 IPv4 addresses");

  });
