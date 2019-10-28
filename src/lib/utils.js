'use strict'

function getRandomElement (array) {
  if (!array.length) return
  if (array.length === 1) return array[0]
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

async function asyncRetry (max, func, ...args) {
  const retryFunc = async (num) => {
    try {
      return await func(...args)
    } catch (e) {
      console.log(e)
      console.log(`Retry ${num} of ${max}`)
      if (num >= max) throw e
    }
    return retryFunc(num++)
  }
  return retryFunc(1)
}

module.exports = {
  getRandomElement,
  asyncRetry
}
