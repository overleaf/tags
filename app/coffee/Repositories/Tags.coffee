Settings = require 'settings-sharelatex'
logger = require('logger-sharelatex')
mongojs = require('mongojs')
db = mongojs(Settings.mongo?.url, ['tags'])
ObjectId = require('mongojs').ObjectId
metrics = require('metrics-sharelatex')

# Note that for legacy reasons, user_id and project_ids are plain strings,
# not ObjectIds.

module.exports = Tags =
	getUserTags: (user_id, callback = (err, user)->)->
		db.tags.find {"user_id" : user_id}, callback
	
	createTag: (user_id, name, callback = (err, tag) ->) ->
		db.tags.insert({ user_id, name, project_ids: [] }, callback)

	addProjectToTag: (user_id, tag_id, project_id, callback = (error) ->)->
		try
			tag_id = ObjectId(tag_id)
		catch e
			return callback(e)
		searchOps =
			_id:tag_id
			user_id:user_id
		insertOperation = 
			"$addToSet": {project_ids:project_id}
		db.tags.update(searchOps, insertOperation, callback)

	removeProjectFromTag: (user_id, tag_id, project_id, callback = (error) ->)->
		try
			tag_id = ObjectId(tag_id)
		catch e
			return callback(e)
		searchOps =
			_id:tag_id
			user_id:user_id
		deleteOperation = 
			"$pull": {project_ids:project_id}
		db.tags.update searchOps, deleteOperation, callback

	removeProjectFromAllTags: (user_id, project_id, callback)->
		searchOps = 
			user_id:user_id
		deleteOperation = 
			"$pull": {project_ids:project_id}
		db.tags.update searchOps, deleteOperation, multi:true, callback
	
	deleteTag: (user_id, tag_id, callback = (error) ->) ->
		try
			tag_id = ObjectId(tag_id)
		catch e
			return callback(e)
		db.tags.remove {
			_id: tag_id,
			user_id: user_id
		}, callback
	
	renameTag: (user_id, tag_id, name, callback = (error) ->) ->
		try
			tag_id = ObjectId(tag_id)
		catch e
			return callback(e)
		db.tags.update {
			_id: tag_id,
			user_id: user_id
		}, {
			$set:
				name: name
		}, callback

metrics.timeAsyncMethod(Tags, 'getUserTags', 'Tags.getUserTags', logger)
metrics.timeAsyncMethod(Tags, 'createTag', 'Tags.createTag', logger)
metrics.timeAsyncMethod(Tags, 'addProjectToTag', 'Tags.addProjectToTag', logger)
metrics.timeAsyncMethod(Tags, 'removeProjectFromTag', 'Tags.removeProjectFromTag', logger)
metrics.timeAsyncMethod(Tags, 'removeProjectFromAllTags', 'Tags.removeProjectFromAllTags', logger)
metrics.timeAsyncMethod(Tags, 'deleteTag', 'Tags.deleteTag', logger)
metrics.timeAsyncMethod(Tags, 'renameTag', 'Tags.renameTag', logger)
