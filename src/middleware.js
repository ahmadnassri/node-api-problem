import Problem from './index'

export default function Middleware (space = null) {
  return (err, req, res, next) => {
    if (err instanceof Problem) {
      err.send(res, space)
    } else {
      return next()
    }
  }
}
