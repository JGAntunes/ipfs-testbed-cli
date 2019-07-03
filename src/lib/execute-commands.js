#!/usr/bin/env node
'use strict'

const ipfsClient = require('ipfs-http-client')
const async = require('async')

const setup = require('./setup.js')

const networks = require('../../networks')

function executeCommands(networkName) {
  return new Promise( async (resolve, reject) => {
    const mappedNodes = await setup(networkName)
    const { commands } = networks[networkName]

    async.eachSeries( 
      commands, 
      execute.bind(null, mappedNodes),
      (err) => err ? reject(err) : resolve()
    ) 
  })
}

async function execute(mappedNodes, { node, command }) {
  const ipfsNode = mappedNodes[node]
  const ipfs = ipfsClient(ipfsNode.hosts.ipfsAPI)
  const res = await command(ipfs)
}

module.exports = executeCommands
