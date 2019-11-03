'use strict'

function getRandomElement (array) {
  if (!array.length) return
  if (array.length === 1) return array[0]
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

async function asyncRetry (max, func, ...args) {
  let error
  for (let i = 1; i <= max; i++) {
    try {
      return await func(...args)
    } catch (e) {
      console.log(e)
      console.log(`Retry ${i} of ${max}`)
      error = e
    }
  }
  throw error
}

module.exports = {
  getRandomElement,
  asyncRetry
}
