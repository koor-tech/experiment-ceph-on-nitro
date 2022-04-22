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

const clusterOutputDirectory = process.env.CLUSTER_OUTPUT_DIR_PATH;
if (!clusterOutputDirectory) { throw new Error("ENV variable [CLUSTER_OUTPUT_DIR_PATH] missing"); }

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

const adminSSHKey = new aws.ec2.KeyPair(
  "admin-ssh-key",
  {
    keyName: ec2SSHKeyName,
    publicKey: fs.readFileSync(sshKeyAbsolutePath).toString() },
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
    keyName: adminSSHKeyKeyName,

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

//////////////////
// Worker nodes //
//////////////////

const worker0 = new aws.ec2.Instance(
  `${environment}-worker-0`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: adminSSHKeyKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-0`,
      WorkerId: "worker-0",
      Environment: environment,
    },
  },
  { dependsOn: [ ctrl0 ] },
);


export const worker0PublicIPV4 = worker0.publicIp;

const worker1 = new aws.ec2.Instance(
  `${environment}-worker-1`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: adminSSHKeyKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-1`,
      WorkerId: "worker-1",
      Environment: environment,
    },
  },
  { dependsOn: [ worker0 ] },
);

export const worker1PublicIPV4 = worker1.publicIp;

const worker2 = new aws.ec2.Instance(
  `${environment}-worker-2`,
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: mainSubnetAZ,
    keyName: adminSSHKeyKeyName,

    subnetId: mainSubnetID,
    vpcSecurityGroupIds: [
      workerSecurityGroupID,
    ],

    userData: fs.readFileSync(workerUserDataAbsolutePath).toString(),

    tags: {
      Name: `${environment}-worker-2`,
      WorkerId: "worker-2",
      Environment: environment,
    },
  },
  { dependsOn: [ worker1 ] },
);

export const worker2PublicIPV4 = worker2.publicIp;

//////////////////
// File Outputs //
//////////////////

// Write the load balancer IP for the controllers to disk to disk
pulumi
  .all([ ctrl0PublicIPV4, worker0PublicIPV4, worker1PublicIPV4, worker2PublicIPV4 ])
  .apply(([ ctrlIP, worker0IP, worker1IP, worker2IP ]) => {
    let filePath;
    const outputDir = clusterOutputDirectory;

    // Create the cluster output dir if it's not present
    fs.mkdirSync(outputDir, { recursive: true });

    // Write ipv4 for ctrl 0
    filePath = path.join(outputDir, "ctrl-0-ipv4Address")
    fs.writeFileSync(filePath, ctrlIP);
    pulumi.log.info(`successfuly wrote controller ctrl-0 IPv4 address @ [${filePath}]`);

    // Write ipv4 for worker 0
    filePath = path.join(outputDir, "worker-0-ipv4Address")
    fs.writeFileSync(filePath, worker0IP);
    pulumi.log.info(`successfuly wrote worker 0 IPv4 address @ [${filePath}]`);

    // Write ipv4 for worker 1
    filePath = path.join(outputDir, "worker-1-ipv4Address")
    fs.writeFileSync(filePath, worker1IP);
    pulumi.log.info(`successfuly wrote worker 1 IPv4 address @ [${filePath}]`);

    // Write ipv4 for worker 2
    filePath = path.join(outputDir, "worker-2-ipv4Address")
    fs.writeFileSync(filePath, worker2IP);
    pulumi.log.info(`successfuly wrote worker 2 IPv4 address @ [${filePath}]`);
  });
