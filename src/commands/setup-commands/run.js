#!/usr/bin/env node
'use strict'

const executeCommands = require('../../lib/execute-commands')

const cmd = {
  command: 'run <network>',
  desc: 'run commands script',
  builder: (yargs) => {
    yargs.positional('network', {
      describe: 'name of the network commands script',
      type: 'string'
    })
  },
  handler: async ({ network }) => {
    await executeCommands(network)
    console.log("\nCommands Executed")
  }
}

module.exports = cmd
