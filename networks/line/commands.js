let id;

// TODO: tentar por isto a passar o contexto
module.exports = [
  { 
    node: "provider",
    command: async (ipfs) => { 
      id = await ipfs.id() 
    }
  },
  { 
    node: "consumer",
    command: async (ipfs) => {
      await ipfs.ping(id.id)
    }
  }
]
