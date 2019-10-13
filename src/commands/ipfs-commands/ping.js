#!/usr/bin/env node
'use strict'

const pull = require('pull-stream')
const ipfsClient = require('ipfs-http-client')

const { getRandomElement } = require('../../lib/utils')
const k8sClient = require('../../lib/kubernetes-client')

const cmd = {
  command: 'ping <to-peer-id> [from-peer-id]',
  desc: 'execute a ping <to-peer-id> from [from-peer-id] or a random peer',
  builder: (yargs) => {
    yargs.positional('to-peer-id', {
      describe: 'peer to ping',
      type: 'string'
    }).positional('from-peer-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    }).options('count', {
      describe: 'packet count to send',
      alias: 'n',
      type: 'number',
      default: 10
    }).options('node-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ fromPeerdId, toPeerId, count, nodeId }) => {
    const res = await k8sClient.getNodeInfo({ peerId: fromPeerdId, id: nodeId })
    const node = getRandomElement(res)
    if (!node) return
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    console.log({ name: node.name, id: node.id })
    pull(
      ipfs.pingPullStream(toPeerId, { count }),
      pull.log()
    )
  }
}

module.exports = cmd
