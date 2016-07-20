import Middleware from '../src/middleware'
import Problem from '../src/index'
import { test } from 'tap'

const CONTENT_TYPE = 'application/problem+json'

test('Express Middleware', (assert) => {
  assert.plan(4)

  let problem = new Problem(404)

  let req = {}
  let res = {
    set (name, value) {
      assert.equal(value, CONTENT_TYPE, 'set correct Content-Type')
    },

    send (body) {
      assert.equal(body, JSON.stringify(problem), 'serialized JSON response')
    }
  }

  Middleware()(problem, req, res)

  res = {
    set (name, value) {},

    send (body) {
      assert.equal(body, JSON.stringify(problem, null, 2), 'spaced + serialized JSON response')
    }
  }

  Middleware(2)(problem, req, res)

  Middleware(2)(null, req, res, () => assert.ok(true, 'passthrough when no match'))
})
