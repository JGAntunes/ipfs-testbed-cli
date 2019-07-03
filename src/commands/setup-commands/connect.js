#!/usr/bin/env node
'use strict'

const connectNodes = require('../../lib/connect-nodes')

const cmd = {
  command: 'connect <network>',
  desc: 'connect nodes as specified by in the <network> file',
  builder: (yargs) => {
    yargs.positional('network', {
      describe: 'name of the network file',
      type: 'string'
    })
  },
  handler: async ({ network }) => {
    await connectNodes(network)
    console.log("Nodes Connected")
  }
}

module.exports = cmd
