import Problem from './index'

const CONTENT_TYPE = 'application/problem+json'

export default function Middleware (space = null) {
  return (err, req, res, next) => {
    if (err instanceof Problem) {
      res.set('Content-Type', CONTENT_TYPE)
      res.send(JSON.stringify(err, null, space))
    } else {
      return next()
    }
  }
}
