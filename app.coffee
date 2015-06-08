Settings = require 'settings-sharelatex'
logger = require 'logger-sharelatex'
logger.initialize("tags-sharelatex")
express = require('express')
app = express()
controller = require("./app/js/TagsController")
db = require('mongojs').connect(Settings.mongo.url, ['tags'])
Path = require("path")
metrics = require("metrics-sharelatex")
metrics.initialize("tags")
metrics.mongodb.monitor(Path.resolve(__dirname + "/node_modules/mongojs/node_modules/mongodb"), logger)

app.configure ()->
	app.use express.methodOverride()
	app.use express.bodyParser()
	app.use metrics.http.monitor(logger)
	app.use express.errorHandler()

app.get '/user/:user_id/tag', controller.getUserTags

app.post '/user/:user_id/project/:project_id/tag', controller.addTag

app.del '/user/:user_id/project/:project_id/tag', controller.removeTag

app.del '/user/:user_id/project/:project_id', controller.removeProjectFromAllTags

app.get '/status', (req, res)->
	res.send('tags sharelatex up')

app.get '*', (req, res)->
	res.send 404

host = Settings.internal?.tags?.host || "localhost"
port = Settings.internal?.tags?.port || 3012
app.listen port, host, ->
	logger.info "tags starting up, listening on #{host}:#{port}"
