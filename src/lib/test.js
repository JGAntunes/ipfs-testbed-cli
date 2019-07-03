#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')
const async = require('async')

const k8sClient = require('./kubernetes-client')
const networks = require('../../networks')

const {
  connParallelLimit: connLimit,
  idParallelLimit: idLimit
} = require('../config').setup

let network;

async function setup (networkName) {
  network = networks[networkName].network
  const k8sNodes = await k8sClient.getNodeInfo()

  if (k8sNodes < network.nodes.length)
    throw new Error(`Not enough IPFS nodes deployed. Networks requires ${network.nodes.length}.`)

  const mappedNodes = Object.keys(network.nodes).reduce((nodes, name, index) => {
    nodes[name] = k8sNodes[index]
    return nodes
  }, {})  // map network given names to k8s nodes

  async.waterfall([
    async.constant(mappedNodes),
    fetchIPFSAddresses,
    connectNodes
  ], (err) => { 
    if(err) 
      return console.log(err)

    executeCommands = ExecuteCommands(mappedNodes)
    console.log("Network Setup Completed")
  })
}

function fetchIPFSAddresses(mappedNodes, cb) {
  async.eachLimit( Object.keys(mappedNodes), idLimit, async (nodeName) => {
    const node = mappedNodes[nodeName]
    const ipfs = ipfsClient(node.hosts.ipfsAPI)
    const id = await ipfs.id()
    console.log(id)
    mappedNodes[nodeName] = { ...node, address: id.addresses[0] }
  }, (err) => err ? cb(err) : cb(null, mappedNodes) )
}

function connectNodes(mappedNodes, cb) {
  console.log(mappedNodes)
  async.eachLimit( 
    Object.keys(mappedNodes), 
    idLimit, 
    connectNode.bind(null, mappedNodes),
    (err) => err ? cb(err) : cb(null, mappedNodes)
  ) 
}

function connectNode(mappedNodes, nodeName, cb) {
  const networkNode = network.nodes[nodeName]

  if (!networkNode.links) return;

  const ipfsNode = mappedNodes[nodeName]
  const ipfs = ipfsClient(ipfsNode.hosts.ipfsAPI)

  async.eachLimit(
    networkNode.links,
    connLimit,
    connect.bind(null, mappedNodes, ipfs),
    (err) => err ? cb(err) : cb()
  )
}

async function connect(mappedNodes, ipfs, dest) {
  const destAddr = mappedNodes[dest].address
  const connect = await ipfs.swarm.connect(destAddr)
  console.log(connect)
}

setup('line')
