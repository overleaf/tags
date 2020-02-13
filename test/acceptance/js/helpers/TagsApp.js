/* eslint-disable
    handle-callback-err,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = require('../../../../app')
const settings = require('settings-sharelatex')

module.exports = {
  running: false,
  initing: false,
  callbacks: [],
  ensureRunning(callback) {
    if (callback == null) {
      callback = function(error) {}
    }
    if (this.running) {
      return callback()
    } else if (this.initing) {
      return this.callbacks.push(callback)
    } else {
      this.initing = true
      this.callbacks.push(callback)
      return app.listen(
        settings.internal.tags.port,
        settings.internal.tags.host,
        error => {
          if (error != null) {
            throw error
          }
          this.running = true
          return (() => {
            const result = []
            for (callback of Array.from(this.callbacks)) {
              result.push(callback())
            }
            return result
          })()
        }
      )
    }
  }
}
