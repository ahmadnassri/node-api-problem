const Middleware = require('../lib/middleware')
const Problem = require('../lib/index')
const tap = require('tap')

const CONTENT_TYPE = 'application/problem+json'

tap.test('Express Middleware', assert => {
  assert.plan(5)

  let problem = new Problem(404)

  let req = {}
  let res = {
    writeHead (status, headers) {
      assert.equal(status, '404', 'set correct status code')
      assert.same(headers, { 'Content-Type': CONTENT_TYPE }, 'set correct HTTP headers')
    },

    end (body) {
      assert.equal(body, JSON.stringify(problem), 'serialized JSON response')
    }
  }

  Middleware()(problem, req, res)

  res = {
    writeHead (status, headers) {},

    end (body) {
      assert.equal(body, JSON.stringify(problem, null, 2), 'spaced + serialized JSON response')
    }
  }

  Middleware(2)(problem, req, res)

  Middleware(2)(null, req, res, () => assert.ok(true, 'passthrough when no match'))
})
