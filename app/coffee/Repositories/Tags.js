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
		db.tags.insert({ user_id, name, project_ids: [] }, (err, tag) ->
			# on duplicate key error return existing tag
			if err && err.code == 11000
				return db.tags.findOne({user_id, name}, callback)
			callback err, tag
		)

	updateTagUserIds: (old_user_id, new_user_id, callback = (err, tag) ->) ->
		searchOps =
			user_id:old_user_id
		updateOperation = 
			"$set": {user_id:new_user_id}
		db.tags.update(searchOps, updateOperation, multi:true, callback)

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

	addProjectToTagName: (user_id, name, project_id, callback = (error) ->)->
		searchOps =
			name:name
			user_id:user_id
		insertOperation =
			"$addToSet": {project_ids:project_id}
		db.tags.update(searchOps, insertOperation, upsert:true, callback)

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


[
	'getUserTags',
	'createTag',
	'addProjectToTag',
	'removeProjectFromTag',
	'removeProjectFromAllTags',
	'deleteTag',
	'renameTag'
].map (_method) ->
	metrics.timeAsyncMethod(Tags, _method, 'mongo.Tags', logger)

