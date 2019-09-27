#!/usr/bin/env node
'use strict'

const readline = require('readline')
const fs = require('fs')
const k8sClient = require('../../../lib/kubernetes-client')
const { getRandomElement } = require('../../../lib/utils')
const ipfsClient = require('ipfs-http-client')

const cmd = {
  command: 'load [file]',
  desc: 'run a series of commands loaded from [file] or stdin',
  builder: (yargs) => {
    yargs.positional('file', {
      describe: 'file path containing line separated JSON commands',
      type: 'string'
    })
  },
  handler: async ({ file }) => {
    const commandStream = file ? fs.createReadStream(file) : process.stdin
    const rl = readline.createInterface({
      input: commandStream,
      crlfDelay: Infinity
    })
    // Topics index for name -> cid
    const topics = {}
    for await (const line of rl) {
      let command
      try {
        command = JSON.parse(line)
      } catch (e) {
        console.error(e)
        continue
      }
      // TODO NEXT
      const res = await k8sClient.getNodeInfo({ command })
      const node = getRandomElement(res)
      const ipfs = ipfsClient(node.hosts.ipfsAPI)
      switch (command.type) {
        case ('topic'):
          const topic = await ipfs.pulsarcast.createTopic(command.name)
          topics[topic.name] = topic.cid
          console.log(`Created topic ${topic.name} with cid ${topic.cid}`)
          break
        case ('user'):
          for await (const event of command.events) {
            const topicCid = topics[event.topic]
            if (!topicCid) {
              console.error(new Error(`Cannot find topic ${event.topic} CID`))
              continue
            }
            await ipfs.pulsarcast.publish(topicCid, Buffer.from(JSON.stringify(event)))
            console.log(`Sent event to topic ${event.topic} from node ${command.node}`)
          }
          break
      }
    }
    // if (!node) return
    // const ipfs = ipfsClient(node.hosts.ipfsAPI)
    // const response = await ipfs.pulsarcast.createTopic(topicName)
    // console.log({ name: node.name, id: node.id })
    // console.log(response)
  }
}

module.exports = cmd
