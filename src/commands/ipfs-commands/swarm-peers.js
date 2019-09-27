#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')

const { getRandomElement } = require('../../lib/utils')
const k8sClient = require('../../lib/kubernetes-client')

const cmd = {
  command: 'swarm peers [peer-id]',
  desc: 'execute a get swarm peers from [peer-id] or a random peer',
  builder: (yargs) => {
    yargs.positional('peer-id', {
      describe: 'peer to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ peerId }) => {
    const res = await k8sClient.getNodeInfo({ peerId })
    const node = getRandomElement(res)
    if (!node) return
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    console.log({ name: node.name, id: node.id })
    const peers = await ipfs.swarm.peers()
    console.log(peers)
  }
}

module.exports = cmd
