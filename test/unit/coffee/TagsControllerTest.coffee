sinon = require('sinon')
chai = require('chai')
should = chai.should()
modulePath = "../../../app/js/TagsController.js"
SandboxedModule = require('sandboxed-module')
assert = require('assert')

user_id = "51dc93e6fb625a261300003b"
tag_name = '123434'
tag_id = "tag-id-123"
project_id = "51dc93e6fb625a261300003a"

describe 'Tags controller', ->
	beforeEach ->
		self = @
		@tagsRepository = {}
		@res = {}
		@res.status = sinon.stub().returns @res
		@res.end = sinon.stub()
		@controller = SandboxedModule.require modulePath, requires:
			'logger-sharelatex': log:->
			'./Repositories/Tags':@tagsRepository


	describe "getUserTags", ->
		it 'should ask the tags repository for the users tags', (done)->
			stubbedTags = [{name:"some tag", project_ids:["12354"]}]
			@tagsRepository.getUserTags = sinon.stub().callsArgWith(1, null, stubbedTags)
			req = 
				params:
					user_id: user_id
					project_id: project_id
			@controller.getUserTags req, json:(result)=>
				result.should.equal stubbedTags
				@tagsRepository.getUserTags.calledWith(user_id).should.equal true
				done()

	describe "addProjectToTag", ->
		beforeEach ->
			@tagsRepository.addProjectToTag = sinon.stub().callsArg(3)
			@req = 
				params:
					user_id: user_id
					tag_id: tag_id
					project_id: project_id
			@controller.addProjectToTag @req, @res
			
		it "should tell the repository to add the tag to the project", ->
			@tagsRepository.addProjectToTag
				.calledWith(user_id, tag_id, project_id)
				.should.equal true
		
		it "should return a 204 status code", ->
			@res.status.calledWith(204).should.equal true
			@res.end.called.should.equal true

	describe "removeProjectFromTag", ->
		beforeEach ->
			@tagsRepository.removeProjectFromTag = sinon.stub().callsArg(3)
			@req = 
				params:
					user_id: user_id
					tag_id: tag_id
					project_id: project_id
			@controller.removeProjectFromTag @req, @res
			
		it "should tell the repository to remove the tag from the project", ->
			@tagsRepository.removeProjectFromTag
				.calledWith(user_id, tag_id, project_id)
				.should.equal true
		
		it "should return a 204 status code", ->
			@res.status.calledWith(204).should.equal true
			@res.end.called.should.equal true

	describe "removeProjectFromAllTags", ->
		it 'should tell the repository to remove that project from all the users tags', (done)->
			@tagsRepository.removeProjectFromAllTags = sinon.stub().callsArgWith(2)
			req = 
				params:
					user_id: user_id
					project_id: project_id
			@controller.removeProjectFromAllTags req, send:(result)=>
				@tagsRepository.removeProjectFromAllTags.calledWith(user_id, project_id).should.equal true
				done()
	
	describe "deleteTag", ->
		beforeEach ->
			@tagsRepository.deleteTag = sinon.stub().callsArg(2)
			@req = 
				params:
					user_id: user_id
					tag_id: tag_id
			@controller.deleteTag @req, @res
			
		it "should tell the repository to delete the tag", ->
			@tagsRepository.deleteTag
				.calledWith(user_id, tag_id)
				.should.equal true
		
		it "should return a 204 status code", ->
			@res.status.calledWith(204).should.equal true
			@res.end.called.should.equal true

	describe "renameTag", ->
		beforeEach ->
			@tagsRepository.renameTag = sinon.stub().callsArg(3)
			@req = 
				params:
					user_id: user_id
					tag_id: tag_id
				body:
					name: @name = "new-name"
			@controller.renameTag @req, @res
			
		it "should tell the repository to rename the tag", ->
			@tagsRepository.renameTag
				.calledWith(user_id, tag_id, @name)
				.should.equal true
		
		it "should return a 204 status code", ->
			@res.status.calledWith(204).should.equal true
			@res.end.called.should.equal true