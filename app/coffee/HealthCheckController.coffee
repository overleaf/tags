request = require("request")
async = require("async")
settings = require("settings-sharelatex")
port = settings.internal.tags.port
logger = require "logger-sharelatex"
ObjectId = require("mongojs").ObjectId

request = request.defaults({timeout: 3000})

buildUrl = (path) ->
	"http://localhost:#{port}#{path}"

module.exports = HealthCheck = 
	check : (callback)->
		project_id = ObjectId()
		user_id = ObjectId(settings.tags.healthCheck.user_id)
		tagName = "smoke-test-tag-#{Math.floor(Math.random() * 50)}" # use a random tag name to reduce conflicts
		request.post {
			url: buildUrl("/user/#{user_id}/tag"),
			json:
				name: tagName
		}, (err, res, body) ->
			if err?
				logger.log "Failed executing create tag health check"
				return callback(err)
			if res.statusCode != 200
				return callback new Error("unexpected statusCode: #{res.statusCode}")
			if !body?._id?
				return callback new Error("#{tagName} tag not created - clobbered by another health check?")
			logger.log {tag: body, user_id, project_id}, "health check created tag"
			tag_id = body._id


			request.post {
				url: buildUrl("/user/#{user_id}/tag/#{tag_id}/project/#{project_id}")
			}, (err, res, body) ->
				if err?
					logger.log "Failed executing create project in tag health check"
					return callback(err)
				if res.statusCode != 204
					return callback new Error("unexpected statusCode: #{res.statusCode}")

				request.get {
					url: buildUrl("/user/#{user_id}/tag"),
					json: true
				}, (err, res, tags) ->
					if err?
						logger.log "Failed executing list tags health check"
						return callback(err)
					if res.statusCode != 200
						return callback new Error("unexpected statusCode: #{res.statusCode}")
					hasTag = false
					for tag in tags
						logger.log {tag:tag, project_id: project_id.toString()}, "checking tag"
						if project_id.toString() in tag.project_ids
							hasTag = true
							break
					if !hasTag
						return callback new Error("tag was not found in response")

					request.del {
						url: buildUrl("/user/#{user_id}/tag/#{tag_id}"),
						json: true
					}, (err, res, body) ->
						if err?
							logger.log "Failed executing delete tags health check"
						otherTags = (tag for tag in tags when tag._id isnt tag_id)
						HealthCheck._removeOldTags user_id, otherTags, () ->
							callback(err, res, body)

	_removeOldTags: (user_id, tags, callback) ->
		now = new Date()
		getAge = (tag) ->
			(now - ObjectId(tag._id).getTimestamp())
		# clean up tags older than 5 minutes
		oldTags = (tag for tag in tags when getAge(tag) > 5*60*1000)
		removeTag = (tag, cb) ->
			logger.log {tag:tag}, "removing old tag"
			request.del {
				url: buildUrl("/user/#{user_id}/tag/#{tag._id}")
				json: true
			}, (err) ->
				cb() # ignore failures removing old tags
		# remove a limited number tags on each pass to avoid timeouts
		async.mapSeries oldTags.slice(0,3), removeTag, callback
