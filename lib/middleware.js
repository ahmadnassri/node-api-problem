const Problem = require('./index')

module.exports = function Middleware (space) {
  return (err, req, res, next) => {
    if (err instanceof Problem) {
      err.send(res, space || null)
    } else {
      return next()
    }
  }
}
