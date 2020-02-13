/* eslint-disable
    camelcase,
    handle-callback-err,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const TagsRepository = require("./Repositories/Tags");
const logger = require("logger-sharelatex");

module.exports = {
	getUserTags(req, res, next){
		const {user_id} = req.params;
		logger.log({user_id}, "getting user tags");
		return TagsRepository.getUserTags(user_id, function(error, tags){
			if (error != null) { return next(error); }
			return res.json(tags);
		});
	},
	
	createTag(req, res, next) {
		const {user_id} = req.params;
		const {
            name
        } = req.body;
		logger.log({user_id, name}, "creating tag");
		return TagsRepository.createTag(user_id, name, function(error, tag) {
			if (error != null) { return next(error); }
			return res.json(tag);
		});
	},

	updateTagUserIds(req, res, next){
		const old_user_id = req.params.user_id;
		const new_user_id = req.body.user_id;
		logger.log({old_user_id, new_user_id}, "updating user_id for tags");
		return TagsRepository.updateTagUserIds(old_user_id, new_user_id, function(error){
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	},

	addProjectToTag(req, res, next){
		const {user_id, project_id, tag_id} = req.params;
		logger.log({user_id, project_id, tag_id}, "adding project to tag");
		return TagsRepository.addProjectToTag(user_id, tag_id, project_id, function(error) {
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	},

	addProjectToTagName(req, res, next){
		const {user_id, project_id} = req.params;
		const {
            name
        } = req.body;
		logger.log({user_id, project_id, name}, "adding project to tag name");
		return TagsRepository.addProjectToTagName(user_id, name, project_id, function(error) {
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	},

	removeProjectFromTag(req, res, next){
		const {user_id, project_id, tag_id} = req.params;
		logger.log({user_id, project_id, tag_id}, "removing project from tag");
		return TagsRepository.removeProjectFromTag(user_id, tag_id, project_id, function(error) {
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	},

	removeProjectFromAllTags(req, res, next){
		logger.log({user_id: req.params.user_id, project_id:req.params.project_id}, "removing project from all tags");
		return TagsRepository.removeProjectFromAllTags(req.params.user_id, req.params.project_id, (err, tags) => res.send());
	},
	
	renameTag(req, res, next) {
		const {user_id, tag_id} = req.params;
		const {name} = req.body;
		logger.log({user_id, tag_id, name}, "renaming tag");
		return TagsRepository.renameTag(user_id, tag_id, name, function(error) {
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	},
	
	deleteTag(req, res, next) {
		const {user_id, tag_id} = req.params;
		logger.log({user_id, tag_id}, "deleting tag");
		return TagsRepository.deleteTag(user_id, tag_id, function(error) {
			if (error != null) { return next(error); }
			return res.status(204).end();
		});
	}
};
