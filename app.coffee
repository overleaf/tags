Settings = require 'settings-sharelatex'
logger = require 'logger-sharelatex'
logger.initialize("tags-sharelatex")
express = require('express')
app = express()
controller = require("./app/js/TagsController")
Path = require("path")
metrics = require("metrics-sharelatex")
metrics.initialize("tags")
# metrics.mongodb.monitor(Path.resolve(__dirname + "/node_modules/mongojs/node_modules/mongodb"), logger)

app.configure ()->
	app.use express.methodOverride()
	app.use express.bodyParser()
	app.use metrics.http.monitor(logger)
	app.use express.errorHandler()

app.get  '/user/:user_id/tag', controller.getUserTags
app.post '/user/:user_id/tag', controller.createTag
app.post '/user/:user_id/tag/:tag_id/rename', controller.renameTag
app.del  '/user/:user_id/tag/:tag_id', controller.deleteTag
app.post '/user/:user_id/tag/:tag_id/project/:project_id', controller.addProjectToTag
app.del  '/user/:user_id/tag/:tag_id/project/:project_id', controller.removeProjectFromTag
app.del  '/user/:user_id/project/:project_id', controller.removeProjectFromAllTags

app.get '/status', (req, res)->
	res.send('tags sharelatex up')

app.get '*', (req, res)->
	res.send 404

host = Settings.internal?.tags?.host || "localhost"
port = Settings.internal?.tags?.port || 3012
app.listen port, host, ->
	console.log "tags-sharelatex listening at #{host}:#{port}"
