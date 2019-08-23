const Problem = require('../lib')
const STATUS_CODES = require('http').STATUS_CODES
const tap = require('tap')

const BASE_URI = ''
const CONTENT_TYPE = 'application/problem+json'
const DEFAULT_TYPE = 'about:blank'
const ERR_STATUS = '"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)'
const ERR_TITLE = 'missing "title". a short, human-readable summary of the problem type'
const STATUS_CODES_WEB = 'https://httpstatuses.com/'

tap.test('API Problem', assert => {
  assert.plan(19)

  assert.ok(new Problem(404) instanceof Problem, 'Problem prototype')

  assert.doesNotThrow(() => new Problem(207), /RFC7231/, 'Allow 207 as a valid status code')
  assert.throws(() => new Problem(), /RFC7231/, ERR_STATUS)
  assert.throws(() => new Problem(200), /RFC7231/, ERR_STATUS)
  assert.throws(() => new Problem(444), /human-readable/, ERR_TITLE)

  assert.equal(new Problem(402).title, STATUS_CODES[402], '"title" SHOULD be the same as the recommended HTTP status phrase for "status"')
  assert.equal(new Problem(402).type, STATUS_CODES_WEB + 402, '"type" should use STATUS_CODES_WEB when using standard "STATUS_CODES" and no "type" provided')

  assert.equal(new Problem(444, 'foo').type, STATUS_CODES_WEB + 444, `default "type" should be an IANA_STATUS_CODE link`)

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz').type, `${Problem.BASE_URI}baz`, `"BASE_URI" should changee to "${Problem.BASE_URI}"`)

  Problem.DEFAULT_TYPE = 'baz'

  assert.equal(new Problem(404).type, `${Problem.BASE_URI}${Problem.DEFAULT_TYPE}`, `"DEFAULT_TYPE" should change to "${Problem.DEFAULT_TYPE}"`)

  // reset
  Problem.BASE_URI = BASE_URI
  Problem.DEFAULT_TYPE = DEFAULT_TYPE

  assert.equal(new Problem(404, 'foo').title, 'foo', 'custom "title"')
  assert.equal(new Problem(452, 'foo').status, '452', 'custom "status"')
  assert.equal(new Problem(404, 'foo', 'foo://bar/').type, 'foo://bar/', 'custom "type" ')

  assert.equal(new Problem(404, { foo: 'bar' }).foo, 'bar', 'members immediately after "status"')
  assert.equal(new Problem(404, 'foo', { foo: 'bar' }).foo, 'bar', 'members immediately after "title"')
  assert.equal(new Problem(404, 'foo', 'foo://bar/', { foo: 'bar' }).foo, 'bar', 'members immediately after "type"')

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz', { instance: 'baz' }).instance, 'foo://bar/baz', '"instance" inherits "BASE_URI"')

  assert.equal(new Problem(404).toString(), `[404] Not Found (${STATUS_CODES_WEB}404)`, 'toString() yeilds is "[status] title (type)"')

  assert.equal(new Problem(404, 'foo', 'bar').message, new Problem(404, 'foo', 'bar').toString(), 'with status, title, and type: error class message matches toString() output')
})

tap.test('HTTP Response', assert => {
  assert.plan(3)

  let problem = new Problem(404)

  let response = {
    writeHead: (status, headers) => {
      assert.equal(status, '404', 'set correct status code')
      assert.equal(headers['Content-Type'], CONTENT_TYPE, 'set correct Content-Type')
    },

    end: body => {
      assert.equal(body, JSON.stringify(problem), 'serialized JSON response')
    }
  }

  problem.send(response)
})
