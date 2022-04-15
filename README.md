# Faster Ceph on Nitro

[Nitro][aws-nitro] is faster than EBS right? But how much faster is it... on a real life workload -- an [atom scale][cern-ceph] storage system like [Ceph][ceph]? Let's find out.

This research was funded by [OCV][ocv] & [Koor][koor] -- [Koor][koor] is on a mission to make your Ceph deployments a little less chaotic, and [Open Core Ventures][ocv] is providing rocket fuel.

## How are we going to test?

Well we're going to do something simple in a very complex environment -- run a "real life" workload like [`pgbench`][pgbench] on top of two just-in-time provisioned Ceph systems -- one with AWS Nitro and one without.

With stock settings on just about everything this experiment is less about reaching the theoretical maximum performance and seeing what benefits Nitro can provide without deep thought -- this is the magic sauce (and performance) that AWS is going through great lengths to provide.

We're going to:

1. Provision compute resources on AWS
2. Set up a k8s cluster on those machines
3. Install Rook
4. Run `pgbench`

Then, we're going to do the same thing again, but the second time will be ⚡supercharged by AWS Nitro⚡.

## Shoulders of giants

As Koor specialies in [Rook][rook] installations, we're going to get a helping hand from all the giants we can:

- [Rook][rook]
- [k0s][k0s]
- [Kubernetes][k8s]
- [Pulumi][pulumi] (for wrangling [AWS][aws])

It's a lot of documentation to read, but reading up on these technologies is a great idea if you want to understand this experiment deeply.

## Getting started

To run this experiment you'll need to do the following:

1. Install [`direnv`][direnv]
2. Install [`git-crypt`][git-crypt] and set up a `secrets` directory (`git-crypt init && mkdir secrets`)
2. Setup your [CLI AWS credentials][aws-credentials]
3. Fill out and use the example `.env` at the bottom of this file

### Example `.env` configuration

Here's a `.env` file you should fill out:

```bash
export AWS_CONFIG_FILE=$(realpath path/to/your/aws/config/file)
export AWS_SHARED_CREDENTIALS_FILE=$(realpath path/to/your/aws/config/file)
```

## Running the experiment

To run the experiment:

```console
$ make
```

A little more explicitly:

```console
$ make deploy test
```

For more information on what runs in each target, see [`Makefile`](./Makefile).

[aws-nitro]: https://aws.amazon.com/ec2/nitro/
[cern-ceph]: https://www.youtube.com/watch?v=OopRMUYiY5E
[koor]: https://koor.tech
[k0s]: https://github.com/k0sproject/k0s
[k8s]: https://kubernetes.io
[ocv]: https://opencoreventures.com/
[aws-credentials]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
[aws]: https://aws.amazon.com
[pulumi]: https://pulumi.com
[pgbench]: https://www.postgresql.org/docs/current/pgbench.html
