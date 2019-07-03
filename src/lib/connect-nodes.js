#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')
const async = require('async')

const setup = require('./setup.js')
const networks = require('../../networks')

const { connParallelLimit, idParallelLimit } = require('../config').setup
let network

function connectNodes(networkName) {
  return new Promise( async (resolve, reject) => {
    network = networks[networkName].network
    const mappedNodes = await setup(networkName)
    async.eachLimit( 
      Object.keys(mappedNodes), 
      idParallelLimit, 
      connectNode.bind(null, mappedNodes),
      (err) => err ? reject(err) : resolve()
    ) 
  })
}

function connectNode(mappedNodes, nodeName, cb) {
  const networkNode = network.nodes[nodeName]

  if (!networkNode.links) return cb();

  const ipfsNode = mappedNodes[nodeName]
  const ipfs = ipfsClient(ipfsNode.hosts.ipfsAPI)

  async.eachLimit(
    networkNode.links,
    connParallelLimit,
    connect.bind(null, mappedNodes, ipfs),
    (err) => err ? cb(err) : cb()
  )
}

async function connect(mappedNodes, ipfs, dest) {
  const destAddr = mappedNodes[dest].address
  const connect = await ipfs.swarm.connect(destAddr)
}

module.exports = connectNodes
