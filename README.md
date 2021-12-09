## Install on my ABT Node

[![Install on my ABT Node](https://raw.githubusercontent.com/blocklet/development-guide/main/assets/install_on_abtnode.svg)](https://install.arcblock.io/?action=blocklet-install&meta_url=https%3A%2F%2Fgithub.com%2Fblocklet%2Ffaucet-webapp%2Freleases%2Fdownload%2Fv0.2.14%2Fblocklet.json)

## faucet-webapp

![](https://github.com/blocklet/faucet-webapp/workflows/release-blocklet/badge.svg)
![](https://img.shields.io/badge/Powered%20By-ABT%20Node-yellowgreen)

Serve blocklet registry service

## Run and debug in the cloud with Gitpod

Click the "Open in Gitpod" button, Gitpod will start ABT Node and the blocklet.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/blocklet/faucet-webapp)

## Run and debug locally

```shell
yarn global add @abtnode/cli
git clone git@github.com:blocklet/faucet-webapp.git
cd faucet-webapp
abtnode init --mode debug
abtnode start
abtnode dev
```

## License

Apache-2.0
