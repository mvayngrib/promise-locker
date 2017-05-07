const test = require('tape')
const co = require('co').wrap
const locker = require('../')

test('lock', loudCo(function* (t) {
  const lock = locker()
  const unlockA = yield lock('a')
  let unlockedA
  lock('a')
    .then(() => {
      t.equal(unlockedA, true)
      t.end()
    })
    .catch(t.error)

  // can lock on another id
  const unlockB = yield lock('b')
  yield wait(100)
  unlockedA = true
  unlockA()
}))

test('lock timeout', loudCo(function* (t) {
  // prevent exit
  const timeout = setTimeout(() => {}, 1000)

  const lock = locker({ timeout: 100 })
  yield lock('a')
  const start = Date.now()
  yield lock('a')
  const time = Date.now() - start
  t.ok(time > 50)
  t.end()

  clearTimeout(timeout)
}))

function loudCo (gen) {
  return co(function* (...args) {
    try {
      yield co(gen)(...args)
    } catch (err) {
      console.error(err)
      throw err
    }
  })
}

function wait (millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}
