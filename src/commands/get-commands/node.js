#!/usr/bin/env node
'use strict'

const k8sClient = require('../../lib/kubernetes-client')

const cmd = {
  command: ['nodes [peer-id]', 'node [peer-id]'],
  desc: 'get node info',
  builder: {
    'peer-id': {
      alias: 'peerId'
    }
  },
  handler: async (argv) => {
    const res = await k8sClient.getNodeInfo({ peerId: argv.peerId })
    console.log(JSON.stringify(res, null, 2))
  }
}

module.exports = cmd
