# JS IPFS Testbed CLI

A CLI tool to interact with the [JS-IPFS test bed](https://github.com/jgantunes/ipfs-testbed) built usind NodeJS.

## Requirements

- `nodejs` `>=8` in order to use the cli

**IMPORTANT**: the CLI will use your current kube context, so make sure to have the right cluster selected before jumping on this.

## Install

```
npm install
```

Or skip the install step entirely and just use npx

```
npx -p ipfs-testbed ipt <command>
```

## Cli Usage

```
$ ipt --help
ipt <command>

Commands:
  bin.js create <resources..>  creates the given resources
  bin.js delete <resources..>  delete the given resources
  bin.js exec <command..>      exec <command> in a IPFS Node
  bin.js get <resources..>     get the given resources
  bin.js completion            generate bash completion script

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]

```

You can run `ipt <command> --help` to get further details about a specific command:
```
$ ipt exec pulsarcast --help
ipt exec pulsarcast <command>

exec pulsarcast <command> in this IPFS Node

Commands:
  bin.js exec pulsarcast create             create a topic with name
  <topic-name> [node-id]                    <topic-name> from [from-node-id] or
                                            a random node
  bin.js exec pulsarcast publish            publish <message> at <topic-cid>
  <topic-cid> <message> [node-id]           from [node-id] or a random node
  bin.js exec pulsarcast subscribe          subscribe to <topic-cid> from
  <topic-cid> [node-id]                     [node-id] or a random node

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]

```

## License
MIT
