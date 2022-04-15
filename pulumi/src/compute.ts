import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// import { vpc } from "./network.ts";

const environment = process.env.ENVIRONMENT;
const sshKeyAbsolutePath = process.env.SSH_KEY_ABS_PATH;

const ec2InstanceType = config.require<string>("ec2-instance-type");
const ec2AZList = config.require<string[]>("ec2-az-list");

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
  { publicKey: fs.readFileSync(sshKeyAbsolutePath) },
);

export adminSSHKeyName = adminSSHKey.name;

////////////
// Node 0 //
////////////

const node0 = new aws.ec2.Instance(
  "node-0",
  {
    ami: ami.then(ami => ami.id),
    instanceType: ec2InstanceType,
    availabilityZone: ec2AZList[0],
    keyName: adminSSHKeyName,
    tags: {
      NodeId: "0",
      Environment: environment,
    },
  },
);
