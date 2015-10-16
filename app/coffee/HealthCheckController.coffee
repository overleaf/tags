ObjectId = require("mongojs").ObjectId
request = require("request")
async = require("async")
_ = require("underscore")
crypto = require("crypto")	
settings = require("settings-sharelatex")
port = settings.internal.tags.port
logger = require "logger-sharelatex"


module.exports = 
	check : (callback)->
		project_id = ObjectId()
		user_id = ObjectId(settings.tags.healthCheck.user_id)
		tagName = "smoke-test-tag"
		getOpts = (endPath)-> {url:"http://localhost:#{port}/user/#{user_id}#{endPath}", timeout:3000}
		logger.log user_id:user_id, opts:getOpts(), tagName:tagName, project_id:project_id, "running health check"
		jobs = [
			(cb)->
				opts = getOpts("/project/#{project_id}/tag")
				opts.json = {name: tagName}
				request.post(opts, cb)
			(cb)->
				opts = getOpts("/tag")
				opts.json = true
				request.get opts, (err, res, body)->
					console.log body, tagName

					if res.statusCode != 200
						return cb("status code not 200, its #{res.statusCode}")

					hasTag = _.some body, (tag)-> 
						console.log tag.name == tagName, tagName
						console.log _.contains(tag.project_ids, project_id.toString()), tag.project_ids, project_id
						tag.name == tagName and _.contains(tag.project_ids, project_id.toString())
					if hasTag
						cb()
					else
						cb("tag not found in response")
		]
		async.series jobs, (err)->
			if err?
				callback(err)
			opts = getOpts("/project/#{project_id}/tag")
			opts.json = {name: tagName}
			request.del opts, callback
