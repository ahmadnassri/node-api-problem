'use strict'

const tap = require('tap')

tap.test('build', assert => {
  assert.plan(1)

  try {
    var module = require(`../build/node${process.version.slice(1, 2)}/`)
    assert.type(module, 'function', 'should export a function')
  } catch (e) {
    assert.error(e)
  }
})
