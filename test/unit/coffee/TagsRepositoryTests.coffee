sinon = require('sinon')
chai = require('chai')
expect = chai.expect
should = chai.should()
modulePath = "../../../app/js/Repositories/Tags.js"
SandboxedModule = require('sandboxed-module')
assert = require('assert')
ObjectId = require("mongojs").ObjectId

user_id = "51dc93e6fb625a261300003b"
tag_name = '123434'
project_id = "51dc93e6fb625a261300003a"

describe 'TagsRepository', ->
	beforeEach ->
		self = @
		@findOneStub = sinon.stub()
		@findStub = sinon.stub()
		@saveStub = sinon.stub()
		@insertStub = sinon.stub().callsArg(1)
		@updateStub = sinon.stub().callsArg(2)
		@removeStub = sinon.stub().callsArg(1)
		@callback = sinon.stub()

		@mongojs = () =>
			return tags:
				update: self.mongojsUpdate 
				find: @findStub
				findOne: @findOneStub
				save: @saveStub
				insert: @insertStub
				update: @updateStub
				remove: @removeStub
		@mongojs.ObjectId = ObjectId

		@repository = SandboxedModule.require modulePath, requires:
			'logger-sharelatex': log:->
			'settings-sharelatex': {}
			'mongojs':@mongojs
			'metrics-sharelatex': {timeAsyncMethod: ()->}

	describe 'finding users tags', ->
		it 'should find all the documents with that user id', (done)->
			stubbedTags = [{"name":"tag1"}, {"name":"tag2"}, {"name":"tag3"}]
			@findStub.callsArgWith(1, null, stubbedTags)
			@repository.getUserTags user_id, (err, result)->
				result.length.should.equal 3
				result[0].should.equal stubbedTags[0]
				result[1].should.equal stubbedTags[1]
				result[2].should.equal stubbedTags[2]
				done()

	describe "createTag", ->
		describe "when insert succeeds", ->
			beforeEach ->
				@repository.createTag "user-id", "name", @callback

			it "should call insert in mongo", ->
				expect(@insertStub.lastCall.args[0]).to.deep.equal
					user_id: "user-id"
					name: "name"
					project_ids: []

			it "should call the callback", ->
				@callback.called.should.equal true

		describe "when insert has duplicate key error error", ->
			beforeEach ->
				@duplicateKeyError = new Error "Duplicate"
				@duplicateKeyError.code = 11000
				@insertStub.callsArgWith 1, @duplicateKeyError
				@findOneStub.callsArgWith 1, null, "existing-tag"
				@repository.createTag "user-id", "name", @callback

			it "should get tag with findOne", ->
				expect(@findOneStub.lastCall.args[0]).to.deep.equal
					user_id: "user-id"
					name: "name"

			it "should callback with existing tag", ->
				expect(@callback.lastCall.args[1]).to.equal "existing-tag"

	describe 'addProjectToTag', ->
		describe "with a valid tag_id", ->
			beforeEach ->
				@updateStub.callsArg(2)
				@tag_id = ObjectId().toString()
				@repository.addProjectToTag user_id, @tag_id, project_id, @callback

			it "should call update in mongo", ->
				expect(@updateStub.lastCall.args.slice(0,2)).to.deep.equal [
					{
						_id: ObjectId(@tag_id)
						user_id: user_id
					},
					{
						$addToSet: { project_ids: project_id }
					}
				]

			it "should call the callback", ->
				@callback.called.should.equal true
		
		describe "with an invalid tag_id", ->
			beforeEach ->
				@tag_id = "not and object id"
				@repository.addProjectToTag user_id, @tag_id, project_id, @callback
		
			it "should call the callback with and error", ->
				@callback.calledWith(new Error()).should.equal true

	describe 'removeProjectFromTag', ->
		describe "with a valid tag_id", ->
			beforeEach ->
				@updateStub.callsArg(2)
				@tag_id = ObjectId().toString()
				@repository.removeProjectFromTag user_id, @tag_id, project_id, @callback
				
			it "should call update in mongo", ->
				expect(@updateStub.lastCall.args.slice(0,2)).to.deep.equal [
					{
						_id: ObjectId(@tag_id)
						user_id: user_id
					},
					{
						$pull: { project_ids: project_id }
					}
				]

			it "should call the callback", ->
				@callback.called.should.equal true
		
		describe "with an invalid tag_id", ->
			beforeEach ->
				@tag_id = "not and object id"
				@repository.removeProjectFromTag user_id, @tag_id, project_id, @callback
		
			it "should call the callback with and error", ->
				@callback.calledWith(new Error()).should.equal true

	describe 'removeProjectFromAllTags', ->
		it 'should pull the project id from the tag', (done)->
			@updateStub.callsArgWith(3, null)
			@repository.removeProjectFromAllTags user_id, project_id, (err)=>
				searchOps = 
					user_id:user_id
				insertOperation = 
					"$pull": {project_ids:project_id}
				@updateStub.calledWith(searchOps, insertOperation).should.equal true
				done()
	
	describe "deleteTag", ->
		describe "with a valid tag_id", ->
			beforeEach ->
				@tag_id = ObjectId().toString()
				@repository.deleteTag user_id, @tag_id, @callback
				
			it "should call remove in mongo", ->
				expect(@removeStub.lastCall.args[0]).to.deep.equal {
					_id: ObjectId(@tag_id)
					user_id: user_id
				}

			it "should call the callback", ->
				@callback.called.should.equal true
		
		describe "with an invalid tag_id", ->
			beforeEach ->
				@tag_id = "not and object id"
				@repository.deleteTag user_id, @tag_id, @callback
		
			it "should call the callback with and error", ->
				@callback.calledWith(new Error()).should.equal true

	describe "renameTag", ->
		describe "with a valid tag_id", ->
			beforeEach ->
				@updateStub.callsArg(2)
				@tag_id = ObjectId().toString()
				@name = "new-name"
				@repository.renameTag user_id, @tag_id, @name, @callback
				
			it "should call remove in mongo", ->
				expect(@updateStub.lastCall.args.slice(0, 2)).to.deep.equal [
					{
						_id: ObjectId(@tag_id)
						user_id: user_id
					},
					{
						$set: { name: @name }
					}
				]
			
			it "should call the callback", ->
				@callback.called.should.equal true
		
		describe "with an invalid tag_id", ->
			beforeEach ->
				@tag_id = "not and object id"
				@repository.renameTag user_id, @tag_id, "name", @callback
		
			it "should call the callback with and error", ->
				@callback.calledWith(new Error()).should.equal true

