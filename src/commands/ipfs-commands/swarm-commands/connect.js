#!/usr/bin/env node
'use strict'

const k8sClient = require('../../../lib/kubernetes-client')
const { getRandomElement } = require('../../../lib/utils')
const ipfsClient = require('ipfs-http-client')

const cmd = {
  command: 'connect <to-node-id> [from-node-id]',
  desc: 'execute a swarm connect <to-node-id> from [from-node-id]',
  builder: (yargs) => {
    yargs.positional('to-node-id', {
      describe: 'node to ping',
      type: 'string'
    }).positional('from-node-id', {
      describe: 'node to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ fromNodeId, toNodeId }) => {
    if (!fromNodeId) return
    const [ node ] = await k8sClient.getNodeInfo({ nodeId: fromNodeId })
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    console.log({ name: node.name, id: node.id })
    const connect = await ipfs.swarm.connect(toNodeId)
    console.log(connect)
  }
}

module.exports = cmd
