sinon = require('sinon')
chai = require('chai')
should = chai.should()
modulePath = "../../../app/js/Repositories/Tags.js"
SandboxedModule = require('sandboxed-module')
assert = require('assert')

user_id = "51dc93e6fb625a261300003b"
tag_name = '123434'
project_id = "51dc93e6fb625a261300003a"

describe 'creating a user', ->
	beforeEach ->
		self = @
		@findOneStub = sinon.stub()
		@findStub = sinon.stub()
		@saveStub = sinon.stub()
		@updateStub = sinon.stub()

		@mongojs = =>
			tags:
				update: self.mongojsUpdate 
				find: @findStub
				findOne: @findOneStub
				save: @saveStub
				update: @updateStub

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
		it 'should pull the project id from the tag', (done)->
			@updateStub.callsArgWith(2, null)

			@repository.removeProjectFromTag user_id, project_id, tag_name, (err)=>
				searchOps = 
					user_id:user_id
					name:tag_name	
				insertOperation = 
					"$pull": {project_ids:project_id}
				@updateStub.calledWith(searchOps, insertOperation).should.equal true
				done()


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








