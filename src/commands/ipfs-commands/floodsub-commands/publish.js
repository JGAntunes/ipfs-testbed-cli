#!/usr/bin/env node
'use strict'

const k8sClient = require('../../../lib/kubernetes-client')
const { getRandomElement } = require('../../../lib/utils')
const ipfsClient = require('ipfs-http-client')

const cmd = {
  command: 'publish <topic-name> <message> [peer-id]',
  desc: 'publish <message> at <topic-name> from [peer-id] or a random peer',
  builder: (yargs) => {
    yargs.positional('topic-name', {
      describe: 'topic name',
      type: 'string'
    }).positional('message', {
      describe: 'meesage to publish',
      type: 'string'
    }).positional('peer-id', {
      describe: 'peer to execute the command at',
      type: 'string'
    }).options('node-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ topicName, message, peerId, nodeId }) => {
    const res = await k8sClient.getNodeInfo({ peerId, id: nodeId })
    const node = getRandomElement(res)
    if (!node) return
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    await ipfs.pubsub.publish(topicName, Buffer.from(message))
    console.log({ name: node.name, id: node.id })
  }
}

module.exports = cmd
