#!/usr/bin/env node
'use strict'

const cmd = {
  command: 'swarm <command>',
  desc: 'exec swarm <command> in this IPFS Node',
  builder: (yargs) => {
    yargs.commandDir('swarm-commands')
  },
  handler: () => {}
}

module.exports = cmd
