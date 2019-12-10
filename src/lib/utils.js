'use strict'

const TIMEOUT = 1000

function getRandomElement (array) {
  if (!array.length) return
  if (array.length === 1) return array[0]
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

async function asyncRetry (max, func, ...args) {
  let error
  for (let i = 0; i < max; i++) {
    try {
      return await delay(func(...args), i * TIMEOUT)
    } catch (e) {
      console.log('Request error:', {
        statusCode: e.statusCode,
        path: e.path,
        host: e.host,
        message: e.message,
        type: e.type
      })
      console.log(`Retry ${i + 1} of ${max}`)
      error = e
    }
  }
  throw error
}

function delay (val, t) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(val), t)
  })
}

module.exports = {
  getRandomElement,
  asyncRetry,
  delay
}
