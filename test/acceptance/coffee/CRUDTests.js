{expect} = require('chai')
mongojs = require("mongojs")
{ObjectId} = mongojs

Settings = require('settings-sharelatex')
db = mongojs(Settings.mongo.url, ['tags'])

TagsApp = require './helpers/TagsApp'
TagsClient = require './helpers/TagsClient'

describe 'CRUDTests', ->
	before (done) ->
		db.tags.createIndex({
				user_id: 1,
				name: 1
			}, {
				unique: true,
				key: {
					user_id: 1,
					name: 1
				},
				name: 'user_id_1_name_1'
			}, done)

	before (done) ->
		TagsApp.ensureRunning done

	beforeEach ->
		@user_id_1 = ObjectId()
		@user_id_2 = ObjectId()
		@project_id_1 = ObjectId()
		@project_id_2 = ObjectId()
		@tag_1 = "__TAG_1_#{Math.random()}__"
		@tag_2 = "__TAG_2_#{Math.random()}__"
		@tag_3 = "__TAG_3_#{Math.random()}__"

	describe 'Create', ->
		beforeEach (done) ->
			TagsClient.createTag @user_id_1, @tag_1, (@err, @res, @body) =>
				done()

		describe 'createTag', ->
			it 'should not see an error', ->
				expect(@err).to.not.exist

			it 'should return 200', ->
				expect(@res.statusCode).to.equal(200)

			describe 'creating a duplicate', ->
				beforeEach (done) ->
					TagsClient.createTag @user_id_1, @tag_1, (@err2, @res2, @body2) =>
						done()

				it 'should not see an error too', ->
					expect(@err2).to.not.exist

				it 'should return 200 too', ->
					expect(@res2.statusCode).to.equal(200)

				it 'should return the same doc', ->
					expect(@body).to.deep.equal(@body2)

			describe 'creating a second tag', ->
				beforeEach (done) ->
					TagsClient.createTag @user_id_1, @tag_2, (@err2, @res2, @body2) =>
						done()

				it 'should not see an error too', ->
					expect(@err2).to.not.exist

				it 'should return 200 too', ->
					expect(@res2.statusCode).to.equal(200)

				it 'should return different doc', ->
					expect(@body).to.not.deep.equal(@body2)

	describe 'Get', ->
		beforeEach (done) ->
			TagsClient.createTag @user_id_1, @tag_1, =>
				TagsClient.createTag @user_id_1, @tag_2, done

		describe 'getUserTags', ->
			it 'should return the two tags', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tags = body.map((tagDoc) -> tagDoc.name).sort()
					expect(tags).to.deep.equal([@tag_1, @tag_2])
					done()

			describe 'with a second user', ->
				beforeEach (done) ->
					TagsClient.createTag @user_id_2, @tag_3, done

				it 'should show two tags for user 1', (done) ->
					TagsClient.getUserTags @user_id_1, (err, res, body) =>
						tags = body.map((tagDoc) -> tagDoc.name).sort()
						expect(tags).to.deep.equal([@tag_1, @tag_2])
						done()

				it 'should show one tag to user 2', (done) ->
					TagsClient.getUserTags @user_id_2, (err, res, body) =>
						tags = body.map((tagDoc) -> tagDoc.name)
						expect(tags).to.deep.equal([@tag_3])
						done()

	describe 'Update', ->
		beforeEach (done) ->
			TagsClient.createTag @user_id_1, @tag_1, (err, res, body) =>
				@user_1_tag_1_id = body._id
				TagsClient.createTag @user_id_1, @tag_2, done

		describe 'updateTagUserIds', ->
			beforeEach (done) ->
				TagsClient.updateTagUserIds @user_id_1, @user_id_2, done

			it 'should return no tags for user 1', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tags = body.map((tagDoc) -> tagDoc.name)
					expect(tags).to.deep.equal([])
					done()

			it 'should return the two tags for user 2', (done) ->
				TagsClient.getUserTags @user_id_2, (err, res, body) =>
					tags = body.map((tagDoc) -> tagDoc.name).sort()
					expect(tags).to.deep.equal([@tag_1, @tag_2])
					done()

		describe 'renameTag', ->
			beforeEach (done) ->
				@tag_1_renamed = "#{@tag_1}_renamed__"
				TagsClient.renameTag @user_id_1, @user_1_tag_1_id, @tag_1_renamed, done

			it 'should return the new name for tag 1', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tags = body.map((tagDoc) -> tagDoc.name).sort()
					expect(tags[0]).to.equal(@tag_1_renamed)
					done()

		describe 'adding a project to a tag', ->
			describe 'addProjectToTag', ->
				beforeEach (done) ->
					TagsClient.addProjectToTag @user_id_1, @user_1_tag_1_id, @project_id_1, done

				it 'should have the project id in the list', (done) ->
					TagsClient.getUserTags @user_id_1, (err, res, body) =>
						tagDocs = body.sort((tagDoc) -> tagDoc.name)
						expect(tagDocs[0].project_ids).to.deep.equal([@project_id_1.toString()])
						done()

				describe 'adding a second project to the tag', ->
					beforeEach (done) ->
						TagsClient.addProjectToTag @user_id_1, @user_1_tag_1_id, @project_id_2, done

					it 'should have both project ids in the list', (done) ->
						TagsClient.getUserTags @user_id_1, (err, res, body) =>
							tagDocs = body.sort((tagDoc) -> tagDoc.name)
							projectIds = tagDocs[0].project_ids.sort()
							expect(projectIds).to.deep.equal([@project_id_1.toString(), @project_id_2.toString()])
							done()

			describe 'addProjectToTagName', ->
				beforeEach (done) ->
					TagsClient.addProjectToTagName @user_id_1, @tag_1, @project_id_1, done

				it 'should have the project id in the list', (done) ->
					TagsClient.getUserTags @user_id_1, (err, res, body) =>
						tagDocs = body.sort((tagDoc) -> tagDoc.name)
						expect(tagDocs[0].project_ids).to.deep.equal([@project_id_1.toString()])
						done()

		describe 'removeProjectFromTag', ->
			beforeEach (done) ->
				TagsClient.addProjectToTagName @user_id_1, @tag_1, @project_id_1, =>
					TagsClient.removeProjectFromTag @user_id_1, @user_1_tag_1_id, @project_id_1, done

			it 'should not have the project id in the list', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tagDocs = body.sort((tagDoc) -> tagDoc.name)
					expect(tagDocs[0].project_ids).to.deep.equal([])
					done()

		describe 'removeProjectFromTag with multiple projects and removing the first', ->
			beforeEach (done) ->
				TagsClient.addProjectToTagName @user_id_1, @tag_1, @project_id_1, =>
					TagsClient.addProjectToTagName @user_id_1, @tag_1, @project_id_2, =>
						TagsClient.removeProjectFromTag @user_id_1, @user_1_tag_1_id, @project_id_1, =>
							TagsClient.getUserTags @user_id_1, (err, res, body) =>
								tagDocs = body.sort((tagDoc) -> tagDoc.name)
								@projectIds = tagDocs[0].project_ids
								done()

			it 'should not have the first project id in the list', (done) ->
					expect(@projectIds).to.not.include(@project_id_1.toString())
					done()

			it 'should have the second project id in the list', (done) ->
				expect(@projectIds).to.include(@project_id_2.toString())
				done()

		describe 'removeProjectFromAllTags', ->
			beforeEach (done) ->
				TagsClient.addProjectToTagName @user_id_1, @tag_1, @project_id_1, =>
					TagsClient.addProjectToTagName @user_id_1, @tag_2, @project_id_1, =>
						TagsClient.removeProjectFromAllTags @user_id_1, @project_id_1, done

			it 'should not have the project id in the list for tag 1', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tagDocs = body.sort((tagDoc) -> tagDoc.name)
					expect(tagDocs[0].project_ids).to.deep.equal([])
					done()

			it 'should not have the project id in the list for tag 2', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tagDocs = body.sort((tagDoc) -> tagDoc.name)
					expect(tagDocs[1].project_ids).to.deep.equal([])
					done()

	describe 'Delete', ->
		beforeEach (done) ->
			TagsClient.createTag @user_id_1, @tag_1, (err, res, body) =>
				@user_1_tag_1_id = body._id
				TagsClient.createTag @user_id_1, @tag_2, done

		describe 'deleteTag', ->
			beforeEach (done) ->
				TagsClient.deleteTag @user_id_1, @user_1_tag_1_id, done

			it 'should not return tag 1', (done) ->
				TagsClient.getUserTags @user_id_1, (err, res, body) =>
					tags = body.map((tagDoc) -> tagDoc.name).sort()
					expect(tags).to.not.include(@tag_1)
					done()
