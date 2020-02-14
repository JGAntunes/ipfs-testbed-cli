#!/usr/bin/env node
'use strict'

const k8sClient = require('../../../lib/kubernetes-client')
const { getRandomElement, shuffle } = require('../../../lib/utils')
const toxiproxyClient = require('../../../lib/toxiproxy-client')

const cmd = {
  command: 'latency [peer-id]',
  desc: 'add latency toxic to [peer-id] (or a random peer) incoming conns',
  builder: (yargs) => {
    yargs.options('latency', {
      describe: 'latency (in ms) to inject',
      type: 'number',
      default: 500
    }).options('jitter', {
      describe: 'delay to +/- latencey (in ms)',
      type: 'number',
      default: 50
    }).options('toxicity', {
      describe: 'probability of toxic being applied',
      type: 'number',
      default: 1
    }).options('stream', {
      describe: 'inject toxic upstream or downstream',
      type: 'string',
      default: 'downstream'
    }).options('bulk', {
      describe: 'bulk percentage of nodes to add latency to, randomly',
      type: 'number'
    }).options('node-id', {
      describe: 'ipfs node to execute the command at',
      type: 'string'
    })
  },
  handler: async ({ peerId, latency, toxicity, jitter, stream, bulk, nodeId }) => {
    const res = await k8sClient.getNodeInfo({ peerId, id: nodeId })
    const nodes = []
    if (bulk) {
      const nodeNumber = Math.round(bulk * res.length)
      shuffle(res)
      nodes.push(...res.slice(0, nodeNumber))
    } else {
      nodes.push(getRandomElement(res))
    }
    for (const node of nodes) {
      const payload = {
        type: 'latency',
        stream,
        toxicity,
        attributes: {
          latency,
          jitter
        }
      }
      try {
        const toxic = await toxiproxyClient.createToxic(node.hosts.toxiproxyAPI, payload)
        console.log('Created Toxic:')
        console.log({ name: node.name, id: node.id })
        console.log(toxic)
      } catch (e) {
        console.log('Error: ', e)
      }
    }
  }
}

module.exports = cmd
