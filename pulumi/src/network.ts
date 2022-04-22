import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const environment = process.env.ENVIRONMENT;

// Main VPC
const mainVPC = new aws.ec2.Vpc(
  "main",
  { cidrBlock: "10.0.0.0/16" },
);

export const mainVPCARN = mainVPC.arn;
export const mainVPCID = mainVPC.arn;

