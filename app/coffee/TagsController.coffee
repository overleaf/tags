TagsRepository = require("./Repositories/Tags")
logger = require("logger-sharelatex")

module.exports =

	getUserTags: (req, res)->
		logger.log user_id: req.params.user_id, "getting user tags"
		TagsRepository.getUserTags req.params.user_id, (err, tags)->
			logger.log {err, tags, user_id: req.params.user_id}, "got tags"
			res.json(tags)

	addTag: (req, res)->
		logger.log user_id: req.params.user_id, project_id:req.params.project_id, tag_name:req.body.name, "adding tag"
		TagsRepository.addProjectToTag req.params.user_id, req.params.project_id, req.body.name, (err, tags)->
			res.send()

	removeProjectFromTag: (req, res)->
		{user_id, project_id, tag_id} = req.params
		logger.log {user_id, project_id, tag_id}, "removing project from tag"
		TagsRepository.removeProjectFromTag user_id, tag_id, project_id, (error) ->
			return next(error) if error?
			res.status(204).end()

	removeProjectFromAllTags:(req, res)->
		logger.log user_id: req.params.user_id, project_id:req.params.project_id, "removing project from all tags"
		TagsRepository.removeProjectFromAllTags req.params.user_id, req.params.project_id, (err, tags)->
			res.send()
	
	renameTag: (req, res, next) ->
		{user_id, tag_id} = req.params
		{name} = req.body
		logger.log {user_id, tag_id, name}, "renaming tag"
		TagsRepository.renameTag user_id, tag_id, name, (error) ->
			return next(error) if error?
			res.status(204).end()
	
	deleteTag: (req, res, next) ->
		{user_id, tag_id} = req.params
		logger.log {user_id, tag_id}, "deleting tag"
		TagsRepository.deleteTag user_id, tag_id, (error) ->
			return next(error) if error?
			res.status(204).end()
