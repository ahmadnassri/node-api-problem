import { STATUS_CODES } from 'http'

export const BASE_URI = ''
export const DEFAULT_TYPE = 'about:blank'
export const IANA_STATUS_CODES = 'http://www.iana.org/assignments/http-status-codes#'
export const CONTENT_TYPE = 'application/problem+json'

export const ERR_STATUS = '"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)'
export const ERR_TITLE = 'missing "title". a short, human-readable summary of the problem type'

export default class Problem {
  constructor (status, ...args) {
    let base_uri = Problem.BASE_URI || BASE_URI
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
      type = args[1]
      title = args[0]
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

      if (type === DEFAULT_TYPE) {
        type = IANA_STATUS_CODES + status

        // reset base_uri
        base_uri = ''
      }
    }

    if (!title) {
      throw new Error(ERR_TITLE)
    }

    this.type = base_uri + String(type)
    this.title = String(title)
    this.status = String(status)

    if (members && members.instance) {
      members.instance = base_uri + members.instance
    }

    if (members) {
      Object.assign(this, members)
    }
  }

  toString () {
    return `[${this.status}] ${this.title} (${this.type})`
  }
}

export function Middleware (space = null) {
  return (err, req, res, next) => {
    if (err instanceof Problem) {
      res.set('Content-Type', CONTENT_TYPE)
      res.send(JSON.stringify(err, null, space))
    } else {
      return next()
    }
  }
}
