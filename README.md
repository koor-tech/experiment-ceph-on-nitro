# Faster Ceph on Nitro

[Nitro][aws-nitro] is faster than EBS right? But how much faster is it... on a real life workload -- an [atom scale][cern-ceph] storage system like [Ceph][ceph]? Let's find out.

This research project (codenamed CoN/`con`) was funded by [OCV][ocv] & [Koor][koor] -- [Koor][koor] is on a mission to make your Ceph deployments a little less chaotic, and [Open Core Ventures][ocv] is providing rocket fuel.

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

- [`make`][gnu-make] (at least version 4.2)
- [Rook][rook]
- [k0s][k0s]
- [Kubernetes][k8s]
- [Pulumi][pulumi] (for wrangling [AWS][aws])

It's a lot of documentation to read, but reading up on these technologies is a great idea if you want to understand this experiment deeply.

## Getting started

To run this experiment you'll need to do the following:

1. Install [`direnv`][direnv]
2. Install [`git-crypt`][git-crypt] and set up a `secrets` directory (`git-crypt init && mkdir secrets`)
2. Setup your [CLI AWS credentials][aws-credentials], use a profile named `con-experiment`.
3. Fill out and use the example `.env` at the bottom of this file
4. Install [`kubectl`][kubectl]
5. Install [`kustomize`][kustomize] (`bases` in `kustomization.yaml` doesn't work properly with `kubectl kustomize`)
5. Install [`kubie`][kubie]

### Run setup

To check some dependencies and run some automated setup, run the setup target:

```console
$ make setup
```

After setup completes you should have some new folders including but not limited to the following:

- `secrets` (whose contents should never be checked in, for *this* repo -- see `.gitignore`)
- `secrets/pulumi` (Pulumi-related secrets)

### Example `.envrc` configuration

Here's a `.envrc` file you should fill out:

```bash
# stock | nitro
export ENVIRONMENT=stock

# AWS credentials
export AWS_PROFILE=con-experiemnt
export AWS_CONFIG_FILE=$(realpath ~/.aws/config)
export AWS_SHARED_CREDENTIALS_FILE=$(realpath ~/.aws/credentials)

## Optionally, instead of AWS_PROFILE, AWS_CONFIG_FILE, and AWS_SHARED_CREDENTIALS_FILE...
# export AWS_ACCESS_KEY_ID=$(cat secrets/aws/access-key-id.secret)
# export AWS_SECRET_ACCESS_KEY=$(cat secrets/aws/secret-access-key.secret)

# NOTE: this file is created by setup
export PULUMI_CONFIG_PASSPHRASE=$(cat secrets/pulumi/$ENVIRONMENT/encryption.secret)

# This SSH key will be used to enable access to the machines
export SSH_PUB_KEY_PATH=~/.ssh/id_rsa.pub
export SSH_PUB_KEY_ABS_PATH=$(realpath $SSH_PUB_KEY_PATH)

# Relative path to the userdata that will be installed on controllers
export CONTROLLER_USERDATA_PATH=$(realpath ./config/aws/ec2-controller-userdata.bash)

# Relative path to the userdata that will be installed on nodes
export WORKER_USERDATA_PATH=$(realpath ./config/aws/ec2-worker-userdata.bash)

# Relative path to the folder which will hold the cluster information (ex. ip addresses) after creation
## NOTE: this must be created by running `make setup`
## NOTE: Below this folder will be subfolders for every environment
export CLUSTER_OUTPUT_BASE_DIR_PATH=$(realpath ./secrets/k8s/cluster)
```

Save the contents of the above example to `.envrc` (*not* `.env`).

## Running the experiment

### Set up the infrastructure

To set up the infrastructure (in this example, for `stock`, i.e. non-nitro environment):

```console
$ ENVIRONMENT=stock make
```

This command should:

- Create EC2 instances (one controller node, 3 worker nodes)
- Install k0s on them (and resultingly kubernetes)
- Extract the admin kubeconfig
- Install Rook on them
- Run the tests

Test output should be generated under `output/tests`.

### How To: Interact with the cluster

If you'd like to interact wiht the cluster after it's been setup:

```console
$ make kubie
```

This will drop you into a shell that is configured such that `kubectl` commands will go to the cluster.

## General tips

### Using Make

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
[direnv]: https://direnv.net
[rook]: https://rook.io/docs
[git-crypt]: https://www.agwa.name/projects/git-crypt/
[ceph]: https://docs.ceph.com
[kubectl]: https://kubernetes.io/docs/reference/kubectl
[kubie]: https://github.com/sbstp/kubie
[kustomize]: https://github.com/kubernetes-sigs/kustomize
[gnu-make]: https://www.gnu.org/software/make
