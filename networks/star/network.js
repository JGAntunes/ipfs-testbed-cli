module.exports = {
  nodes: {
    provider: {
      links: [
        "cacheNode"
      ]
    },
    cacheNode: {
      links: [
        "provider",
        "consumer1",
        "consumer2"
      ]
    },
    consumer1: {
      links: [
        "cacheNode"
      ]
    },
    consumer2: {
      links: [
        "cacheNode"
      ]
    }
  }
}
