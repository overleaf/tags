sinon = require('sinon')
chai = require('chai')
should = chai.should()
modulePath = "../../../app/js/TagsController.js"
SandboxedModule = require('sandboxed-module')
assert = require('assert')

user_id = "51dc93e6fb625a261300003b"
tag_name = '123434'
project_id = "51dc93e6fb625a261300003a"

describe 'Tags controller', ->
	beforeEach ->
		self = @
		@tagsRepository = {}
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


	describe "addTag", ->
		it "should tell the repository to add the tag for the project", (done)->
			@tagsRepository.addProjectToTag = sinon.stub().callsArgWith(3)
			req = 
				params:
					user_id: user_id
					project_id: project_id
				body:
					name:"some tag"
			@controller.addTag req, send:(result)=>
				@tagsRepository.addProjectToTag.calledWith(user_id, project_id, "some tag").should.equal true
				done()


	describe "removeTag", ->
		it "should tell the repository to add the tag for the project", (done)->
			@tagsRepository.removeProjectFromTag = sinon.stub().callsArgWith(3)
			req = 
				params:
					user_id: user_id
					project_id: project_id
				body:
					name:"some tag"
			@controller.removeTag req, send:(result)=>
				@tagsRepository.removeProjectFromTag.calledWith(user_id, project_id, "some tag").should.equal true
				done()

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
