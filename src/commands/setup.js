#!/usr/bin/env node
'use strict'

const cmd = {
  command: 'setup',
  desc: 'network setup utilities',
  builder: (yargs) => {
    yargs.commandDir('setup-commands')
  },
  handler: () => {}
}

module.exports = cmd
