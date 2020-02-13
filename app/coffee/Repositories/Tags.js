/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Tags;
const Settings = require('settings-sharelatex');
const logger = require('logger-sharelatex');
const mongojs = require('mongojs');
const db = mongojs(Settings.mongo != null ? Settings.mongo.url : undefined, ['tags']);
const {
    ObjectId
} = require('mongojs');
const metrics = require('metrics-sharelatex');

// Note that for legacy reasons, user_id and project_ids are plain strings,
// not ObjectIds.

module.exports = (Tags = {
	getUserTags(user_id, callback){
		if (callback == null) { callback = function(err, user){}; }
		return db.tags.find({"user_id" : user_id}, callback);
	},
	
	createTag(user_id, name, callback) {
		if (callback == null) { callback = function(err, tag) {}; }
		return db.tags.insert({ user_id, name, project_ids: [] }, function(err, tag) {
			// on duplicate key error return existing tag
			if (err && (err.code === 11000)) {
				return db.tags.findOne({user_id, name}, callback);
			}
			return callback(err, tag);
		});
	},

	updateTagUserIds(old_user_id, new_user_id, callback) {
		if (callback == null) { callback = function(err, tag) {}; }
		const searchOps =
			{user_id:old_user_id};
		const updateOperation = 
			{"$set": {user_id:new_user_id}};
		return db.tags.update(searchOps, updateOperation, {multi:true}, callback);
	},

	addProjectToTag(user_id, tag_id, project_id, callback){
		if (callback == null) { callback = function(error) {}; }
		try {
			tag_id = ObjectId(tag_id);
		} catch (e) {
			return callback(e);
		}
		const searchOps = {
			_id:tag_id,
			user_id
		};
		const insertOperation = 
			{"$addToSet": {project_ids:project_id}};
		return db.tags.update(searchOps, insertOperation, callback);
	},

	addProjectToTagName(user_id, name, project_id, callback){
		if (callback == null) { callback = function(error) {}; }
		const searchOps = {
			name,
			user_id
		};
		const insertOperation =
			{"$addToSet": {project_ids:project_id}};
		return db.tags.update(searchOps, insertOperation, {upsert:true}, callback);
	},

	removeProjectFromTag(user_id, tag_id, project_id, callback){
		if (callback == null) { callback = function(error) {}; }
		try {
			tag_id = ObjectId(tag_id);
		} catch (e) {
			return callback(e);
		}
		const searchOps = {
			_id:tag_id,
			user_id
		};
		const deleteOperation = 
			{"$pull": {project_ids:project_id}};
		return db.tags.update(searchOps, deleteOperation, callback);
	},

	removeProjectFromAllTags(user_id, project_id, callback){
		const searchOps = 
			{user_id};
		const deleteOperation = 
			{"$pull": {project_ids:project_id}};
		return db.tags.update(searchOps, deleteOperation, {multi:true}, callback);
	},
	
	deleteTag(user_id, tag_id, callback) {
		if (callback == null) { callback = function(error) {}; }
		try {
			tag_id = ObjectId(tag_id);
		} catch (e) {
			return callback(e);
		}
		return db.tags.remove({
			_id: tag_id,
			user_id
		}, callback);
	},
	
	renameTag(user_id, tag_id, name, callback) {
		if (callback == null) { callback = function(error) {}; }
		try {
			tag_id = ObjectId(tag_id);
		} catch (e) {
			return callback(e);
		}
		return db.tags.update({
			_id: tag_id,
			user_id
		}, {
			$set: {
				name
			}
		}, callback);
	}
});


[
	'getUserTags',
	'createTag',
	'addProjectToTag',
	'removeProjectFromTag',
	'removeProjectFromAllTags',
	'deleteTag',
	'renameTag'
].map(_method => metrics.timeAsyncMethod(Tags, _method, 'mongo.Tags', logger));

