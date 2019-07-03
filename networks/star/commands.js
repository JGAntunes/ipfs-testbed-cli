const buffer = require('buffer').Buffer
const hash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'

// TODO: tentar por isto a passar o contexto
module.exports = [
  { 
    node: "provider",
    command: async (ipfs) => { 
      let file = Buffer.from('hello')
      const res = await ipfs.add(file)
      console.log(res)
    }
  },
  { 
    node: "consumer1",
    command: async (ipfs) => {
      const res = await ipfs.get(hash)
      console.log(res)
    }
  }
]
