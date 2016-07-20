import Problem from '../src'
import { STATUS_CODES } from 'http'
import { test } from 'tap'

const BASE_URI = ''
const CONTENT_TYPE = 'application/problem+json'
const DEFAULT_TYPE = 'about:blank'
const ERR_STATUS = '"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)'
const ERR_TITLE = 'missing "title". a short, human-readable summary of the problem type'
const IANA_STATUS_CODES = 'http://www.iana.org/assignments/http-status-codes#'

test('API Problem', (assert) => {
  assert.plan(18)

  assert.ok(new Problem(404) instanceof Problem, 'Problem prototype')

  assert.doesNotThrow(() => new Problem(207), /RFC7231/, 'Allow 207 as a valid status code')
  assert.throws(() => new Problem(), /RFC7231/, ERR_STATUS)
  assert.throws(() => new Problem(200), /RFC7231/, ERR_STATUS)
  assert.throws(() => new Problem(444), /human-readable/, ERR_TITLE)

  assert.equal(new Problem(402).title, STATUS_CODES[402], '"title" SHOULD be the same as the recommended HTTP status phrase for "status"')
  assert.equal(new Problem(402).type, IANA_STATUS_CODES + 402, '"type" should use IANA_STATUS_CODES when using standard "STATUS_CODES" and no "type" provided')

  assert.equal(new Problem(444, 'foo').type, DEFAULT_TYPE, `default "type" should be ${DEFAULT_TYPE}`)

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz').type, Problem.BASE_URI + 'baz', `"BASE_URI" should changee to "${Problem.BASE_URI}"`)

  Problem.DEFAULT_TYPE = 'baz'

  assert.equal(new Problem(404).type, Problem.BASE_URI + Problem.DEFAULT_TYPE, `"DEFAULT_TYPE" should change to "${Problem.DEFAULT_TYPE}"`)

  // reset
  Problem.BASE_URI = BASE_URI
  Problem.DEFAULT_TYPE = DEFAULT_TYPE

  assert.equal(new Problem(404, 'foo').title, 'foo', 'custom "title"')
  assert.equal(new Problem(452, 'foo').status, '452', 'custom "status"')
  assert.equal(new Problem(404, 'foo', 'foo://bar/').type, 'foo://bar/', 'custom "type" ')

  assert.deepEqual(new Problem(404, { foo: 'bar' }), { status: '404', title: STATUS_CODES[404], type: IANA_STATUS_CODES + 404, foo: 'bar' }, 'members immediatly after "status"')
  assert.deepEqual(new Problem(404, 'foo', { foo: 'bar' }), { status: '404', title: 'foo', type: DEFAULT_TYPE, foo: 'bar' }, 'members immediatly after "title"')
  assert.deepEqual(new Problem(404, 'foo', 'foo://bar/', { foo: 'bar' }), { status: '404', title: 'foo', type: 'foo://bar/', foo: 'bar' }, 'members immediatly after "type"')

  Problem.BASE_URI = 'foo://bar/'

  assert.equal(new Problem(404, 'foo', 'baz', { instance: 'baz' }).instance, 'foo://bar/baz', '"instance" inherits "BASE_URI"')

  assert.equal(new Problem(404).toString(), `[404] Not Found (${IANA_STATUS_CODES}404)`, 'toString() yeilds is "[status] title (type)"')
})

test('HTTP Response', (assert) => {
  assert.plan(3)

  let problem = new Problem(404)

  let response = {
    writeHead: (status, headers) => {
      assert.equal(status, '404', 'set correct status code')
      assert.equal(headers['Content-Type'], CONTENT_TYPE, 'set correct Content-Type')
    },

    end: (body) => {
      assert.equal(body, JSON.stringify(problem), 'serialized JSON response')
    }
  }

  problem.send(response)
})
