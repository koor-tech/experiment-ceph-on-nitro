import * as fs from "fs";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// import { vpc } from "./network.ts";

///////////////////////////
// Setup & Configuration //
///////////////////////////

const config = new pulumi.Config();

const environment = process.env.ENVIRONMENT;
if (!environment) { throw new Error("ENV variable [ENVIRONMENT] missing"); }

const sshKeyAbsolutePath = process.env.SSH_PUB_KEY_ABS_PATH;
if (!sshKeyAbsolutePath) { throw new Error("ENV variable [SSH_PUB_KEY_ABS_PATH] missing"); }

const ec2InstanceType = config.require("ec2-instance-type");
const ec2Node0AZ = config.require("ec2-node0-az");

/////////
// AMI //
/////////

// https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/
const ami = aws.ec2.getAmi({
  mostRecent: true,
  filters: [
    {
      name: "name",
      values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
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
  { publicKey: fs.readFileSync(sshKeyAbsolutePath).toString() },
);

export const adminSSHKeyKeyPairID = adminSSHKey.keyPairId;

////////////
// Node 0 //
////////////

const node0 = new aws.ec2.Instance(
  "node-0",
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: ec2Node0AZ,
    keyName: adminSSHKeyKeyPairID,
    tags: {
      NodeId: "0",
      Environment: environment,
    },
  },
);
