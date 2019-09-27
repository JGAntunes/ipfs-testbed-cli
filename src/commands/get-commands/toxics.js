#!/usr/bin/env node
'use strict'

const k8sClient = require('../../lib/kubernetes-client')
const toxiproxyClient = require('../../lib/toxiproxy-client')

const cmd = {
  command: ['toxics [toxic] <peer-id>', 'toxic [toxic] <peer-id>'],
  desc: 'lists or gets a toxic from <peer-id>',
  builder: (yargs) => {
    yargs.positional('toxic', {
      describe: 'specific toxic to get',
      type: 'string'
    }).positional('peer-id', {
      describe: 'peer to get the resource from',
      type: 'string'
    })
  },
  handler: async ({ peerId, toxic }) => {
    const res = await k8sClient.getNodeInfo({ peerId })
    const toxics = await toxiproxyClient.getToxics(res[0].hosts.toxiproxyAPI, { toxic })
    console.log(toxics)
  }
}

module.exports = cmd
