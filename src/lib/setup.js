#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')
const async = require('async')

const k8sClient = require('./kubernetes-client')
const networks = require('../../networks')

const { idParallelLimit } = require('../config').setup

function setup (networkName) {
  return new Promise(async (resolve, reject) => {
    const network = networks[networkName].network
    const k8sNodes = await k8sClient.getNodeInfo()
    k8sNodes.sort((a,b) => a.name > b.name ? 1 : -1 ) // make return allways same

    if (k8sNodes.length < Object.keys(network.nodes).length)
      return console.log(`Not enough IPFS nodes deployed. \nNetworks requires ${Object.keys(network.nodes).length}. Cluster has ${k8sNodes.length}`)

    const mappedNodes = Object.keys(network.nodes).reduce((nodes, name, index) => {
      nodes[name] = k8sNodes[index]
      return nodes
    }, {})  // map network given names to k8s nodes

    async.waterfall([
      async.constant(mappedNodes),
      fetchIPFSAddresses
    ], (err) => err ? reject(err) : resolve(mappedNodes))
  })
}

function fetchIPFSAddresses(mappedNodes, cb) {
  async.eachLimit( Object.keys(mappedNodes), idParallelLimit, async (nodeName) => {
    const node = mappedNodes[nodeName]
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    const id = await ipfs.id()
    mappedNodes[nodeName] = { ...node, address: id.addresses[0] }
  }, (err) => err ? cb(err) : cb(null, mappedNodes) )
}

module.exports = setup
