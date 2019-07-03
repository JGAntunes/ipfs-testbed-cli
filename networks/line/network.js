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
        "consumer"
      ]
    },
    consumer: {
      links: [
        "cacheNode"
      ]
    }
  }
}
