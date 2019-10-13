#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')

const { getRandomElement } = require('../../lib/utils')
const k8sClient = require('../../lib/kubernetes-client')

const cmd = {
  command: 'id [peer-id]',
  desc: 'execute a get id from [peer-id] or a random node',
  builder: (yargs) => {
    yargs.positional('peer-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    })
    yargs.options('node-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ peerId, nodeId }) => {
    const res = await k8sClient.getNodeInfo({ peerId, id: nodeId })
    const node = getRandomElement(res)
    if (!node) return
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    console.log({ name: node.name, id: node.id })
    const id = await ipfs.id()
    console.log(id)
  }
}

module.exports = cmd
