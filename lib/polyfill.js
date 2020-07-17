/* istanbul ignore file */

if (!Object.fromEntries) {
  Object.defineProperty(Object, 'fromEntries', {
    value (iterable) {
      return [...iterable].reduce((obj, [key, val]) => {
        obj[key] = val
        return obj
      }, {})
    }
  })
}
