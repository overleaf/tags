metrics = require("metrics-sharelatex")
metrics.initialize("tags")
Settings = require 'settings-sharelatex'
logger = require 'logger-sharelatex'
logger.initialize("tags")
express = require('express')
app = express()
controller = require("./app/js/TagsController")
Path = require("path")
metrics.memory.monitor(logger)

HealthCheckController = require("./app/js/HealthCheckController")

app.configure ()->
	app.use express.methodOverride()
	app.use express.bodyParser()
	app.use metrics.http.monitor(logger)
	app.use express.errorHandler()
metrics.injectMetricsRoute(app)

app.get  '/user/:user_id/tag', controller.getUserTags
app.post '/user/:user_id/tag', controller.createTag
app.put '/user/:user_id/tag', controller.updateTagUserIds
app.post '/user/:user_id/tag/:tag_id/rename', controller.renameTag
app.del  '/user/:user_id/tag/:tag_id', controller.deleteTag
app.post '/user/:user_id/tag/:tag_id/project/:project_id', controller.addProjectToTag
app.post '/user/:user_id/tag/project/:project_id', controller.addProjectToTagName
app.del  '/user/:user_id/tag/:tag_id/project/:project_id', controller.removeProjectFromTag
app.del  '/user/:user_id/project/:project_id', controller.removeProjectFromAllTags

app.get '/status', (req, res)->
	res.send('tags sharelatex up')

app.get '/health_check', (req, res)->
	HealthCheckController.check (err)->
		if err?
			logger.err err:err, "error performing health check"
			res.send 500
		else
			res.send 200

app.get '*', (req, res)->
	res.send 404

host = Settings.internal?.tags?.host || "localhost"
port = Settings.internal?.tags?.port || 3012
app.listen port, host, ->
	logger.info "tags starting up, listening on #{host}:#{port}"
