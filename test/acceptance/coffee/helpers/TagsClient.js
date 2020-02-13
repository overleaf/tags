/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const settings = require("settings-sharelatex");
const request = require("request").defaults({
	jar: false,
	baseUrl: `http://localhost:${settings.internal.tags.port}`,
});

module.exports = {
	getUserTags(user_id, callback) {
		return request.get({
			url: `/user/${user_id}/tag`,
			json: true
		}, callback);
	},

	createTag(user_id, name, callback) {
		return request.post({
			url: `/user/${user_id}/tag`,
			json: {name}
		}, callback);
	},

	updateTagUserIds(old_user_id, new_user_id, callback) {
		return request.put({
			url: `/user/${old_user_id}/tag`,
			json: {user_id: new_user_id}
		}, callback);
	},

	renameTag(user_id, tag_id, new_name, callback) {
		return request.post({
			url: `/user/${user_id}/tag/${tag_id}/rename`,
			json: {name: new_name}
		}, callback);
	},

	deleteTag(user_id, tag_id, callback) {
		return request.del({
			url: `/user/${user_id}/tag/${tag_id}`,
			json: true
		}, callback);
	},

	addProjectToTag(user_id, tag_id, project_id, callback) {
		return request.post({
			url: `/user/${user_id}/tag/${tag_id}/project/${project_id}`,
			json: true
		}, callback);
	},

	addProjectToTagName(user_id, name, project_id, callback) {
		return request.post({
			url: `/user/${user_id}/tag/project/${project_id}`,
			json: {name}
		}, callback);
	},

	removeProjectFromTag(user_id, tag_id, project_id, callback) {
		return request.del({
			url: `/user/${user_id}/tag/${tag_id}/project/${project_id}`,
			json: true
		}, callback);
	},

	removeProjectFromAllTags(user_id, project_id, callback) {
		return request.del({
			url: `/user/${user_id}/project/${project_id}`,
			json: true
		}, callback);
	}
};
