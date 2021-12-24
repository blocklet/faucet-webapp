## faucet-webapp

![](https://github.com/blocklet/faucet-webapp/workflows/release-blocklet/badge.svg)
![](https://img.shields.io/badge/Powered%20By-ABT%20Node-yellowgreen)

Serve blocklet registry service

## Run and debug in the cloud with Gitpod

Click the "Open in Gitpod" button, Gitpod will start Blocklet Server and the blocklet.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/blocklet/faucet-webapp)

## Run and debug locally

```shell
yarn global add @blocklet/cli
git clone git@github.com:blocklet/faucet-webapp.git
cd faucet-webapp
blocklet server init --mode debug
blocklet server start
blocklet dev
```

## License

Apache-2.0
