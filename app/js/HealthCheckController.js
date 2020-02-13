/* eslint-disable
    camelcase,
    handle-callback-err,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let HealthCheck
let request = require('request')
const async = require('async')
const settings = require('settings-sharelatex')
const { port } = settings.internal.tags
const logger = require('logger-sharelatex')
const { ObjectId } = require('mongojs')

request = request.defaults({ timeout: 3000 })

const buildUrl = path => `http://localhost:${port}${path}`

module.exports = HealthCheck = {
  check(callback) {
    const project_id = ObjectId()
    const user_id = ObjectId(settings.tags.healthCheck.user_id)
    const tagName = `smoke-test-tag-${Math.floor(Math.random() * 50)}` // use a random tag name to reduce conflicts
    return request.post(
      {
        url: buildUrl(`/user/${user_id}/tag`),
        json: {
          name: tagName
        }
      },
      function(err, res, body) {
        if (err != null) {
          logger.log('Failed executing create tag health check')
          return callback(err)
        }
        if (res.statusCode !== 200) {
          return callback(new Error(`unexpected statusCode: ${res.statusCode}`))
        }
        if ((body != null ? body._id : undefined) == null) {
          return callback(
            new Error(
              `${tagName} tag not created - clobbered by another health check?`
            )
          )
        }
        logger.log(
          { tag: body, user_id, project_id },
          'health check created tag'
        )
        const tag_id = body._id

        return request.post(
          {
            url: buildUrl(
              `/user/${user_id}/tag/${tag_id}/project/${project_id}`
            )
          },
          function(err, res, body) {
            if (err != null) {
              logger.log('Failed executing create project in tag health check')
              return callback(err)
            }
            if (res.statusCode !== 204) {
              return callback(
                new Error(`unexpected statusCode: ${res.statusCode}`)
              )
            }

            return request.get(
              {
                url: buildUrl(`/user/${user_id}/tag`),
                json: true
              },
              function(err, res, tags) {
                let tag
                if (err != null) {
                  logger.log('Failed executing list tags health check')
                  return callback(err)
                }
                if (res.statusCode !== 200) {
                  return callback(
                    new Error(`unexpected statusCode: ${res.statusCode}`)
                  )
                }
                let hasTag = false
                for (tag of Array.from(tags)) {
                  var needle
                  logger.log(
                    { tag, project_id: project_id.toString() },
                    'checking tag'
                  )
                  if (
                    ((needle = project_id.toString()),
                    Array.from(tag.project_ids).includes(needle))
                  ) {
                    hasTag = true
                    break
                  }
                }
                if (!hasTag) {
                  return callback(new Error('tag was not found in response'))
                }

                return request.del(
                  {
                    url: buildUrl(`/user/${user_id}/tag/${tag_id}`),
                    json: true
                  },
                  function(err, res, body) {
                    if (err != null) {
                      logger.log('Failed executing delete tags health check')
                    }
                    const otherTags = (() => {
                      const result = []
                      for (tag of Array.from(tags)) {
                        if (tag._id !== tag_id) {
                          result.push(tag)
                        }
                      }
                      return result
                    })()
                    return HealthCheck._removeOldTags(user_id, otherTags, () =>
                      callback(err, res, body)
                    )
                  }
                )
              }
            )
          }
        )
      }
    )
  },

  _removeOldTags(user_id, tags, callback) {
    let tag
    const now = new Date()
    const getAge = tag => now - ObjectId(tag._id).getTimestamp()
    // clean up tags older than 5 minutes
    const oldTags = (() => {
      const result = []
      for (tag of Array.from(tags)) {
        if (getAge(tag) > 5 * 60 * 1000) {
          result.push(tag)
        }
      }
      return result
    })()
    const removeTag = function(tag, cb) {
      logger.log({ tag }, 'removing old tag')
      return request.del(
        {
          url: buildUrl(`/user/${user_id}/tag/${tag._id}`),
          json: true
        },
        err => cb()
      ) // ignore failures removing old tags
    }
    // remove a limited number tags on each pass to avoid timeouts
    return async.mapSeries(oldTags.slice(0, 3), removeTag, callback)
  }
}
