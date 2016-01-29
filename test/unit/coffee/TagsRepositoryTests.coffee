sinon = require('sinon')
chai = require('chai')
should = chai.should()
modulePath = "../../../app/js/Repositories/Tags.js"
SandboxedModule = require('sandboxed-module')
assert = require('assert')
ObjectId = require("mongojs").ObjectId

user_id = "51dc93e6fb625a261300003b"
tag_name = '123434'
project_id = "51dc93e6fb625a261300003a"

describe 'creating a user', ->
	beforeEach ->
		self = @
		@findOneStub = sinon.stub()
		@findStub = sinon.stub()
		@saveStub = sinon.stub()
		@updateStub = sinon.stub().callsArg(2)
		@removeStub = sinon.stub().callsArg(1)
		@callback = sinon.stub()

		@mongojs = 
			ObjectId: ObjectId
			connect:=>
				tags:
					update: self.mongojsUpdate 
					find: @findStub
					findOne: @findOneStub
					save: @saveStub
					update: @updateStub
					remove: @removeStub

		@repository = SandboxedModule.require modulePath, requires:
			'logger-sharelatex': log:->
			'settings-sharelatex': {}
			'mongojs':@mongojs

	describe 'getUserTagByName', ->
		it "should find one document and return it", (done)->
			stubbedTag = {name:"tag", project_ids:["1234"]}
			@findOneStub.callsArgWith(1, null, stubbedTag)
			@repository.getUserTagByName user_id, tag_name, (err, tag)=>
				tag.should.equal stubbedTag
				@findOneStub.calledWith({"user_id" : user_id, "name":tag_name}).should.equal true
				done()

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

	describe 'addProjectToTag', ->
		it 'should push the project id into the tag', (done)->
			@updateStub.callsArgWith(3, null)

			@repository.addProjectToTag user_id, project_id, tag_name, (err)=>
				searchOps = 
					user_id:user_id
					name:tag_name	
				insertOperation = 
					"$addToSet": {project_ids:project_id}
				@updateStub.calledWith(searchOps, insertOperation, {upsert:true}).should.equal true
				done()

	describe 'removeProjectFromTag', ->
		describe "with a valid tag_id", ->
			beforeEach ->
				@tag_id = ObjectId().toString()
				@repository.removeProjectFromTag user_id, @tag_id, project_id, @callback
				
			it "should call remove in mongo", ->
				@updateStub
					.calledWith({
						_id: ObjectId(@tag_id)
						user_id: user_id
					}, {
						$pull: { project_ids: project_id }
					})
					.should.equal true
			
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
				@removeStub
					.calledWith({
						_id: ObjectId(@tag_id)
						user_id: user_id
					})
					.should.equal true
			
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
				@updateStub
					.calledWith({
						_id: ObjectId(@tag_id)
						user_id: user_id
					}, {
						$set: { name: @name }
					})
					.should.equal true
			
			it "should call the callback", ->
				@callback.called.should.equal true
		
		describe "with an invalid tag_id", ->
			beforeEach ->
				@tag_id = "not and object id"
				@repository.renameTag user_id, @tag_id, "name", @callback
		
			it "should call the callback with and error", ->
				@callback.calledWith(new Error()).should.equal true

