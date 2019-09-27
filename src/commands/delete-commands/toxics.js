#!/usr/bin/env node
'use strict'

const k8sClient = require('../../lib/kubernetes-client')
const { getRandomElement } = require('../../../lib/utils')
const toxiproxyClient = require('../../lib/toxiproxy-client')

const cmd = {
  command: ['toxics <toxic> [peer-id]', 'toxic <toxic> [peer-id]'],
  desc: 'deletes a toxic from [peer-id] (or a random peer)',
  builder: (yargs) => {
    yargs.positional('toxic', {
      describe: 'specific toxic to delete',
      type: 'string'
    }).positional('peer-id', {
      describe: 'peer to delete the resource from',
      type: 'string'
    })
  },
  handler: async ({ peerId, toxic }) => {
    const res = await k8sClient.getNodeInfo({ peerId })
    const node = getRandomElement(res)
    if (!node) return
    const toxics = await toxiproxyClient.deleteToxic(node.hosts.toxiproxyAPI, toxic)
    console.log({ name: node.name, id: node.id })
    console.log(toxics)
  }
}

module.exports = cmd
