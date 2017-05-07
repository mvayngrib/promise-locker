
const debug = require('debug')('promise-locker')
const once = require('once')
const createSemaphore = require('psem')
const Promise = require('any-promise')
const co = require('co').wrap

module.exports = function createLocker (opts={}) {
  const {
    timeout,
    monitor=5000
  } = opts

  const locks = {}
  return co(function* (id) {
    let lock = locks[id]
    if (lock) {
      debug(`waiting for ${id}`)
      yield lock.wait()
    } else {
      // start unlocked
      debug(`creating lock ${id}`)
      lock = locks[id] = createSemaphore().go()
    }

    debug(`locking ${id}`)
    let timeoutID
    let monitorID
    if (timeout) {
      timeoutID = setTimeout(() => {
        debug(`lock timed out after ${Date.now() - start}ms, releasing`)
        unlock()
      }, timeout)

      unref(timeoutID)
    } else {
      monitorID = setInterval(() => {
        debug(`"${id}" still locked after ${Date.now() - start}ms, did you forgot to call unlock?`)
      }, monitor)

      unref(monitorID)
    }

    const unlock = once(() => {
      debug(`unlocking ${id}`)
      clearTimeout(timeoutID)
      clearInterval(monitorID)
      lock.go()
    })

    lock.stop()
    const start = Date.now()

    return unlock
  })
}

function unref (timer) {
  if (timer.unref) timer.unref()
}
