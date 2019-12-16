#!/usr/bin/env node
'use strict'

const readline = require('readline')
const fs = require('fs')
const k8sClient = require('../../../lib/kubernetes-client')
const { getRandomElement, asyncRetry, delay, shuffle } = require('../../../lib/utils')
const ipfsClient = require('ipfs-http-client')

const MAX_PARALLEL_REQUESTS = 5
const MAX_PARALLEL_COMMANDS = 5

const cmd = {
  command: 'load [file]',
  desc: 'run a series of commands loaded from [file] or stdin',
  builder: (yargs) => {
    yargs.positional('file', {
      describe: 'file path containing line separated JSON commands',
      type: 'string'
    }).options('all-allowed-to-publish', {
      describe: 'set allAllowedToPublish option to true in the topics created',
      type: 'boolean',
      default: false
    })
  },
  handler: async ({ file, allAllowedToPublish }) => {
    const commandStream = file ? fs.createReadStream(file) : process.stdin
    const rl = readline.createInterface({
      input: commandStream,
      crlfDelay: Infinity
    })
    // Topics index for name -> cid
    const topicNamesToCID = {}
    // Events array
    const eventsBuffer = []

    let commandBuffer = []

    // Handle incoming commands and buffer them to run in parallel
    for await (const line of rl) {
      commandBuffer.push(handleCommand(line))
      if (commandBuffer.length >= MAX_PARALLEL_COMMANDS) {
        await Promise.all(commandBuffer)
        commandBuffer = []
      }
    }

    await publishEvents()
    console.log('Done!')

    async function handleCommand (line) {
      let command
      try {
        command = JSON.parse(line)
      } catch (e) {
        console.error(e)
        return
      }
      // TODO NEXT
      const res = await asyncRetry(5, k8sClient.getNodeInfo, { id: command.node })
      const node = getRandomElement(res)
      const ipfs = ipfsClient(node.hosts.ipfsAPI)
      switch (command.type) {
        case ('topic'):
          const topic = await asyncRetry(5, ipfs.pulsarcast.createTopic, command.name, { allAllowedToPublish })
          topicNamesToCID[topic.name] = topic.cid
          console.log(`Created topic ${topic.name} with cid ${topic.cid}`)
          // topicNamesToCID[command.name] = command.name
          // console.log(`Created topic ${command.name}`)
          break
        case ('user'):
          // Store events for later
          eventsBuffer.push({ id: command.node, events: command.events })
          // Subscribe to topics
          const topics = Object.keys(command.subscriptions)

          const subscribe = async (topic) => {
            const topicCid = topicNamesToCID[topic]
            if (!topicCid) {
              // Topic might be in creation process, retry
              console.error(new Error(`Cannot find topic ${topic} CID, trigger retry`))
              return handleCommand(line)
            }
            await asyncRetry(5, ipfs.pulsarcast.subscribe, topicCid)
            console.log(`Node ${command.node} subscribed to ${topicCid} - ${topic}`)
          }

          for (let i = 0; i < topics.length; i += MAX_PARALLEL_REQUESTS) {
            const subscribeToTopics = topics.slice(i, i + MAX_PARALLEL_REQUESTS).map(subscribe)
            await Promise.all(subscribeToTopics)
          }
          break
      }
    }

    async function publishEvents () {
      // We don't want to hit the same node over and over again
      shuffle(eventsBuffer)

      const publish = async ({ id, events }) => {
        const res = await asyncRetry(5, k8sClient.getNodeInfo, { id })
        const node = getRandomElement(res)
        const ipfs = ipfsClient(node.hosts.ipfsAPI)
        for await (const event of events) {
          const topicCid = topicNamesToCID[event.topic]
          if (!topicCid) {
            console.error(new Error(`Cannot find topic ${event.topic} CID`))
            continue
          }
          try {
            await asyncRetry(5, ipfs.pulsarcast.publish, topicCid, Buffer.from(JSON.stringify(event)))
            console.log(`Sent event to topic ${event.topic} from node ${id}`)
          } catch (e) {
            console.log(`Failed to publish event ${event.topic} from node ${id}`)
          }
        }
      }

      // Publish events
      for (let i = 0; i < eventsBuffer.length; i += MAX_PARALLEL_REQUESTS) {
        console.log(`Publishing ${i} to ${i + MAX_PARALLEL_REQUESTS}  from ${eventsBuffer.length} batches`)
        const publishBuffer = eventsBuffer.slice(i, i + MAX_PARALLEL_REQUESTS).map(publish)
        await delay(Promise.all(publishBuffer), 10)
        // await Promise.all(publishBuffer)
      }
    }
  }
}

module.exports = cmd
