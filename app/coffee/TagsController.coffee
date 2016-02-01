TagsRepository = require("./Repositories/Tags")
logger = require("logger-sharelatex")

module.exports =
	getUserTags: (req, res, next)->
		{user_id} = req.params
		logger.log {user_id}, "getting user tags"
		TagsRepository.getUserTags user_id, (error, tags)->
			return next(error) if error?
			res.json(tags)
	
	createTag: (req, res, next) ->
		{user_id} = req.params
		name = req.body.name
		logger.log {user_id, name}, "creating tag"
		TagsRepository.createTag user_id, name, (error, tag) ->
			return next(error) if error?
			res.json(tag)

	addProjectToTag: (req, res, next)->
		{user_id, project_id, tag_id} = req.params
		logger.log {user_id, project_id, tag_id}, "adding project to tag"
		TagsRepository.addProjectToTag user_id, tag_id, project_id, (error) ->
			return next(error) if error?
			res.status(204).end()

	removeProjectFromTag: (req, res, next)->
		{user_id, project_id, tag_id} = req.params
		logger.log {user_id, project_id, tag_id}, "removing project from tag"
		TagsRepository.removeProjectFromTag user_id, tag_id, project_id, (error) ->
			return next(error) if error?
			res.status(204).end()

	removeProjectFromAllTags:(req, res, next)->
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
