const STATUS_CODES = require('http').STATUS_CODES

const BASE_URI = ''
const CONTENT_TYPE = 'application/problem+json'
const DEFAULT_TYPE = 'about:blank'
const ERR_STATUS = '"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)'
const ERR_TITLE = 'missing "title". a short, human-readable summary of the problem type'
const STATUS_CODES_WEB = 'https://httpstatuses.com/'

module.exports = class Problem extends Error {
  constructor () {
    let args = Array.from(arguments)
    let status = args.shift()

    let base = Problem.BASE_URI || BASE_URI
    let members
    let title
    let type
    let i = 3

    while (i--) {
      if (typeof args[i] === 'object') {
        members = args.pop()
        title = args.shift()
        type = args.pop()
      }
    }

    if (args.length) {
      title = args.shift()
      type = args.shift()
    }

    if (!type) {
      type = Problem.DEFAULT_TYPE || DEFAULT_TYPE
    }

    if (!status) {
      throw new Error(ERR_STATUS)
    }

    let statusNumber = Number(status)

    if ((statusNumber >= 600 || statusNumber < 400) && statusNumber !== 207) {
      throw new Error(ERR_STATUS)
    }

    if (!title && STATUS_CODES.hasOwnProperty(status)) {
      title = STATUS_CODES[status]
    }

    if (type === DEFAULT_TYPE) {
      type = STATUS_CODES_WEB + status

      // reset base_uri
      base = ''
    }

    if (!title) {
      throw new Error(ERR_TITLE)
    }

    super(`[${String(status)}] ${String(title)} (${base + String(type)})`)
    this.type = base + String(type)
    this.title = String(title)
    this.status = String(status)

    if (members && members.instance) {
      members.instance = base + members.instance
    }

    if (members) {
      Object.assign(this, members)
    }
  }

  toString () {
    return `[${this.status}] ${this.title} (${this.type})`
  }

  send (response, space) {
    response.writeHead(this.status, { 'Content-Type': CONTENT_TYPE })
    response.end(JSON.stringify(this, null, space))
  }
}
