/* eslint-disable
    handle-callback-err,
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {expect} = require('chai');
const mongojs = require("mongojs");
const {ObjectId} = mongojs;

const Settings = require('settings-sharelatex');
const db = mongojs(Settings.mongo.url, ['tags']);

const TagsApp = require('./helpers/TagsApp');
const TagsClient = require('./helpers/TagsClient');

describe('CRUDTests', function() {
	before(function(done) { return db.tags.createIndex({
            user_id: 1,
            name: 1
        }, {
            unique: true,
            key: {
                user_id: 1,
                name: 1
            },
            name: 'user_id_1_name_1'
        }, done); });

	before(function(done) { return TagsApp.ensureRunning(done); });

	beforeEach(function() {
		this.user_id_1 = ObjectId();
		this.user_id_2 = ObjectId();
		this.project_id_1 = ObjectId();
		this.project_id_2 = ObjectId();
		this.tag_1 = `__TAG_1_${Math.random()}__`;
		this.tag_2 = `__TAG_2_${Math.random()}__`;
		return this.tag_3 = `__TAG_3_${Math.random()}__`;
	});

	describe('Create', function() {
		beforeEach(function(done) {
			return TagsClient.createTag(this.user_id_1, this.tag_1, (err, res, body) => {
				this.err = err;
				this.res = res;
				this.body = body;
				return done();
			});
		});

		return describe('createTag', function() {
			it('should not see an error', function() {
				return expect(this.err).to.not.exist;
			});

			it('should return 200', function() {
				return expect(this.res.statusCode).to.equal(200);
			});

			describe('creating a duplicate', function() {
				beforeEach(function(done) {
					return TagsClient.createTag(this.user_id_1, this.tag_1, (err2, res2, body2) => {
						this.err2 = err2;
						this.res2 = res2;
						this.body2 = body2;
						return done();
					});
				});

				it('should not see an error too', function() {
					return expect(this.err2).to.not.exist;
				});

				it('should return 200 too', function() {
					return expect(this.res2.statusCode).to.equal(200);
				});

				return it('should return the same doc', function() {
					return expect(this.body).to.deep.equal(this.body2);
				});
			});

			return describe('creating a second tag', function() {
				beforeEach(function(done) {
					return TagsClient.createTag(this.user_id_1, this.tag_2, (err2, res2, body2) => {
						this.err2 = err2;
						this.res2 = res2;
						this.body2 = body2;
						return done();
					});
				});

				it('should not see an error too', function() {
					return expect(this.err2).to.not.exist;
				});

				it('should return 200 too', function() {
					return expect(this.res2.statusCode).to.equal(200);
				});

				return it('should return different doc', function() {
					return expect(this.body).to.not.deep.equal(this.body2);
				});
			});
		});
	});

	describe('Get', function() {
		beforeEach(function(done) {
			return TagsClient.createTag(this.user_id_1, this.tag_1, () => {
				return TagsClient.createTag(this.user_id_1, this.tag_2, done);
			});
		});

		return describe('getUserTags', function() {
			it('should return the two tags', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tags = body.map(tagDoc => tagDoc.name).sort();
					expect(tags).to.deep.equal([this.tag_1, this.tag_2]);
					return done();
				});
			});

			return describe('with a second user', function() {
				beforeEach(function(done) {
					return TagsClient.createTag(this.user_id_2, this.tag_3, done);
				});

				it('should show two tags for user 1', function(done) {
					return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
						const tags = body.map(tagDoc => tagDoc.name).sort();
						expect(tags).to.deep.equal([this.tag_1, this.tag_2]);
						return done();
					});
				});

				return it('should show one tag to user 2', function(done) {
					return TagsClient.getUserTags(this.user_id_2, (err, res, body) => {
						const tags = body.map(tagDoc => tagDoc.name);
						expect(tags).to.deep.equal([this.tag_3]);
						return done();
					});
				});
			});
		});
	});

	describe('Update', function() {
		beforeEach(function(done) {
			return TagsClient.createTag(this.user_id_1, this.tag_1, (err, res, body) => {
				this.user_1_tag_1_id = body._id;
				return TagsClient.createTag(this.user_id_1, this.tag_2, done);
			});
		});

		describe('updateTagUserIds', function() {
			beforeEach(function(done) {
				return TagsClient.updateTagUserIds(this.user_id_1, this.user_id_2, done);
			});

			it('should return no tags for user 1', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tags = body.map(tagDoc => tagDoc.name);
					expect(tags).to.deep.equal([]);
					return done();
				});
			});

			return it('should return the two tags for user 2', function(done) {
				return TagsClient.getUserTags(this.user_id_2, (err, res, body) => {
					const tags = body.map(tagDoc => tagDoc.name).sort();
					expect(tags).to.deep.equal([this.tag_1, this.tag_2]);
					return done();
				});
			});
		});

		describe('renameTag', function() {
			beforeEach(function(done) {
				this.tag_1_renamed = `${this.tag_1}_renamed__`;
				return TagsClient.renameTag(this.user_id_1, this.user_1_tag_1_id, this.tag_1_renamed, done);
			});

			return it('should return the new name for tag 1', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tags = body.map(tagDoc => tagDoc.name).sort();
					expect(tags[0]).to.equal(this.tag_1_renamed);
					return done();
				});
			});
		});

		describe('adding a project to a tag', function() {
			describe('addProjectToTag', function() {
				beforeEach(function(done) {
					return TagsClient.addProjectToTag(this.user_id_1, this.user_1_tag_1_id, this.project_id_1, done);
				});

				it('should have the project id in the list', function(done) {
					return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
						const tagDocs = body.sort(tagDoc => tagDoc.name);
						expect(tagDocs[0].project_ids).to.deep.equal([this.project_id_1.toString()]);
						return done();
					});
				});

				return describe('adding a second project to the tag', function() {
					beforeEach(function(done) {
						return TagsClient.addProjectToTag(this.user_id_1, this.user_1_tag_1_id, this.project_id_2, done);
					});

					return it('should have both project ids in the list', function(done) {
						return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
							const tagDocs = body.sort(tagDoc => tagDoc.name);
							const projectIds = tagDocs[0].project_ids.sort();
							expect(projectIds).to.deep.equal([this.project_id_1.toString(), this.project_id_2.toString()]);
							return done();
						});
					});
				});
			});

			return describe('addProjectToTagName', function() {
				beforeEach(function(done) {
					return TagsClient.addProjectToTagName(this.user_id_1, this.tag_1, this.project_id_1, done);
				});

				return it('should have the project id in the list', function(done) {
					return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
						const tagDocs = body.sort(tagDoc => tagDoc.name);
						expect(tagDocs[0].project_ids).to.deep.equal([this.project_id_1.toString()]);
						return done();
					});
				});
			});
		});

		describe('removeProjectFromTag', function() {
			beforeEach(function(done) {
				return TagsClient.addProjectToTagName(this.user_id_1, this.tag_1, this.project_id_1, () => {
					return TagsClient.removeProjectFromTag(this.user_id_1, this.user_1_tag_1_id, this.project_id_1, done);
				});
			});

			return it('should not have the project id in the list', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tagDocs = body.sort(tagDoc => tagDoc.name);
					expect(tagDocs[0].project_ids).to.deep.equal([]);
					return done();
				});
			});
		});

		describe('removeProjectFromTag with multiple projects and removing the first', function() {
			beforeEach(function(done) {
				return TagsClient.addProjectToTagName(this.user_id_1, this.tag_1, this.project_id_1, () => {
					return TagsClient.addProjectToTagName(this.user_id_1, this.tag_1, this.project_id_2, () => {
						return TagsClient.removeProjectFromTag(this.user_id_1, this.user_1_tag_1_id, this.project_id_1, () => {
							return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
								const tagDocs = body.sort(tagDoc => tagDoc.name);
								this.projectIds = tagDocs[0].project_ids;
								return done();
							});
						});
					});
				});
			});

			it('should not have the first project id in the list', function(done) {
					expect(this.projectIds).to.not.include(this.project_id_1.toString());
					return done();
			});

			return it('should have the second project id in the list', function(done) {
				expect(this.projectIds).to.include(this.project_id_2.toString());
				return done();
			});
		});

		return describe('removeProjectFromAllTags', function() {
			beforeEach(function(done) {
				return TagsClient.addProjectToTagName(this.user_id_1, this.tag_1, this.project_id_1, () => {
					return TagsClient.addProjectToTagName(this.user_id_1, this.tag_2, this.project_id_1, () => {
						return TagsClient.removeProjectFromAllTags(this.user_id_1, this.project_id_1, done);
					});
				});
			});

			it('should not have the project id in the list for tag 1', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tagDocs = body.sort(tagDoc => tagDoc.name);
					expect(tagDocs[0].project_ids).to.deep.equal([]);
					return done();
				});
			});

			return it('should not have the project id in the list for tag 2', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tagDocs = body.sort(tagDoc => tagDoc.name);
					expect(tagDocs[1].project_ids).to.deep.equal([]);
					return done();
				});
			});
		});
	});

	return describe('Delete', function() {
		beforeEach(function(done) {
			return TagsClient.createTag(this.user_id_1, this.tag_1, (err, res, body) => {
				this.user_1_tag_1_id = body._id;
				return TagsClient.createTag(this.user_id_1, this.tag_2, done);
			});
		});

		return describe('deleteTag', function() {
			beforeEach(function(done) {
				return TagsClient.deleteTag(this.user_id_1, this.user_1_tag_1_id, done);
			});

			return it('should not return tag 1', function(done) {
				return TagsClient.getUserTags(this.user_id_1, (err, res, body) => {
					const tags = body.map(tagDoc => tagDoc.name).sort();
					expect(tags).to.not.include(this.tag_1);
					return done();
				});
			});
		});
	});
});
