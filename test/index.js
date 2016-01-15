import Problem, * as P from '../src'
import test from 'tape'
import { STATUS_CODES } from 'http'

test('API Problem', assert => {
  assert.ok(new Problem(404) instanceof Problem, 'Problem prototype')

  assert.throws(() => new Problem(), /RFC7231/, P.ERR_STATUS)
  assert.throws(() => new Problem(200), /RFC7231/, P.ERR_STATUS)
  assert.throws(() => new Problem(444), /human-readable/, P.ERR_TITLE)

  assert.equal(new Problem(402).title, STATUS_CODES[402], '"title" SHOULD be the same as the recommended HTTP status phrase for "status"')
  assert.equal(new Problem(402).type, P.IANA_STATUS_CODES + 402, '"type" should use IANA_STATUS_CODES when using standard "STATUS_CODES" and no "type" provided')

  assert.equal(new Problem(444, 'foo').type, P.DEFAULT_TYPE, `default "type" should be ${P.DEFAULT_TYPE}`)

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz').type, Problem.BASE_URI + 'baz', `"BASE_URI" should changee to "${Problem.BASE_URI}"`)

  Problem.DEFAULT_TYPE = 'baz'

  assert.equal(new Problem(404).type, Problem.BASE_URI + Problem.DEFAULT_TYPE, `"DEFAULT_TYPE" should change to "${Problem.DEFAULT_TYPE}"`)

  // reset
  Problem.BASE_URI = P.BASE_URI
  Problem.DEFAULT_TYPE = P.DEFAULT_TYPE

  assert.equal(new Problem(404, 'foo').title, 'foo', 'custom "title"')
  assert.equal(new Problem(452, 'foo').status, '452', 'custom "status"')
  assert.equal(new Problem(404, 'foo', 'foo://bar/').type, 'foo://bar/', 'custom "type" ')

  assert.deepEqual(new Problem(404, { foo: 'bar' }), { status: '404', title: STATUS_CODES[404], type: P.IANA_STATUS_CODES + 404, foo: 'bar' }, 'members immediatly after "status"')
  assert.deepEqual(new Problem(404, 'foo', { foo: 'bar' }), { status: '404', title: 'foo', type: P.DEFAULT_TYPE, foo: 'bar' }, 'members immediatly after "title"')
  assert.deepEqual(new Problem(404, 'foo', 'foo://bar/', { foo: 'bar' }), { status: '404', title: 'foo', type: 'foo://bar/', foo: 'bar' }, 'members immediatly after "type"')

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz', { instance: 'baz' }).instance, 'foo://bar/baz', '"instance" inherits "BASE_URI"')

  assert.equal(new Problem(404).toString(), `[404] Not Found (${P.IANA_STATUS_CODES}404)`, 'toString() yeilds is "[status] title (type)"')
  assert.end()
})

test('Express Middleware', assert => {
  let problem = new Problem(404)

  let req = {}
  let res = {
    set (name, value) {
      assert.equal(value, 'application/problem+json', 'set correct Content-Type')
    },

    send (body) {
      assert.equal(body, JSON.stringify(problem), 'serialized JSON response')
    }
  }

  P.Middleware()(problem, req, res)

  res = {
    set (name, value) {},

    send (body) {
      assert.equal(body, JSON.stringify(problem, null, 2), 'spaced + serialized JSON response')
    }
  }

  P.Middleware(2)(problem, req, res)

  P.Middleware(2)(null, req, res, () => {
    assert.ok(true, 'passthrough when no match')
  })

  assert.end()
})
