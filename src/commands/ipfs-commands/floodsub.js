#!/usr/bin/env node
'use strict'

const cmd = {
  command: 'floodsub <command>',
  desc: 'exec floodsub <command> in this IPFS Node',
  builder: (yargs) => {
    yargs.commandDir('floodsub-commands')
  },
  handler: () => {}
}

module.exports = cmd
