/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const modulePath = "../../../app/js/TagsController.js";
const SandboxedModule = require('sandboxed-module');
const assert = require('assert');

const user_id = "51dc93e6fb625a261300003b";
const tag_name = '123434';
const tag_id = "tag-id-123";
const project_id = "51dc93e6fb625a261300003a";

describe('Tags controller', function() {
	beforeEach(function() {
		const self = this;
		this.tagsRepository = {};
		this.res = {};
		this.res.status = sinon.stub().returns(this.res);
		this.res.end = sinon.stub();
		return this.controller = SandboxedModule.require(modulePath, { requires: {
			'logger-sharelatex': { log() {}
		},
			'./Repositories/Tags':this.tagsRepository,
			'metrics-sharelatex': {timeAsyncMethod: sinon.stub()}
		}
	});});


	describe("getUserTags", () => it('should ask the tags repository for the users tags', function(done){
        const stubbedTags = [{name:"some tag", project_ids:["12354"]}];
        this.tagsRepository.getUserTags = sinon.stub().callsArgWith(1, null, stubbedTags);
        const req = { 
            params: {
                user_id,
                project_id
            }
        };
        return this.controller.getUserTags(req, { json:result=> {
            result.should.equal(stubbedTags);
            this.tagsRepository.getUserTags.calledWith(user_id).should.equal(true);
            return done();
        }
    }
        );
    }));

	describe("addProjectToTag", function() {
		beforeEach(function() {
			this.tagsRepository.addProjectToTag = sinon.stub().callsArg(3);
			this.req = { 
				params: {
					user_id,
					tag_id,
					project_id
				}
			};
			return this.controller.addProjectToTag(this.req, this.res);
		});
			
		it("should tell the repository to add the tag to the project", function() {
			return this.tagsRepository.addProjectToTag
				.calledWith(user_id, tag_id, project_id)
				.should.equal(true);
		});
		
		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});

	describe("addProjectToTagName", function() {
		beforeEach(function() {
			this.tagsRepository.addProjectToTagName = sinon.stub().callsArg(3);
			this.req = {
				body: {
					name: tag_name
				},
				params: {
					user_id,
					project_id
				}
			};
			return this.controller.addProjectToTagName(this.req, this.res);
		});

		it("should tell the repository to add the tag to the project", function() {
			return this.tagsRepository.addProjectToTagName
				.calledWith(user_id, tag_name, project_id)
				.should.equal(true);
		});

		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});

	describe("updateTagUserIds", function() {
		beforeEach(function() {
			this.tagsRepository.updateTagUserIds = sinon.stub().callsArg(2);
			this.req = {
				body: {
					user_id: "new-user-id"
				},
				params: {
					user_id: "old-user-id"
				}
			};
			return this.controller.updateTagUserIds(this.req, this.res);
		});

		it("should tell the repository to update user ids", function() {
			return this.tagsRepository.updateTagUserIds
				.calledWith("old-user-id", "new-user-id")
				.should.equal(true);
		});

		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});

	describe("removeProjectFromTag", function() {
		beforeEach(function() {
			this.tagsRepository.removeProjectFromTag = sinon.stub().callsArg(3);
			this.req = { 
				params: {
					user_id,
					tag_id,
					project_id
				}
			};
			return this.controller.removeProjectFromTag(this.req, this.res);
		});
			
		it("should tell the repository to remove the tag from the project", function() {
			return this.tagsRepository.removeProjectFromTag
				.calledWith(user_id, tag_id, project_id)
				.should.equal(true);
		});
		
		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});

	describe("removeProjectFromAllTags", () => it('should tell the repository to remove that project from all the users tags', function(done){
        this.tagsRepository.removeProjectFromAllTags = sinon.stub().callsArgWith(2);
        const req = { 
            params: {
                user_id,
                project_id
            }
        };
        return this.controller.removeProjectFromAllTags(req, { send:result=> {
            this.tagsRepository.removeProjectFromAllTags.calledWith(user_id, project_id).should.equal(true);
            return done();
        }
    }
        );
    }));
	
	describe("deleteTag", function() {
		beforeEach(function() {
			this.tagsRepository.deleteTag = sinon.stub().callsArg(2);
			this.req = { 
				params: {
					user_id,
					tag_id
				}
			};
			return this.controller.deleteTag(this.req, this.res);
		});
			
		it("should tell the repository to delete the tag", function() {
			return this.tagsRepository.deleteTag
				.calledWith(user_id, tag_id)
				.should.equal(true);
		});
		
		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});

	return describe("renameTag", function() {
		beforeEach(function() {
			this.tagsRepository.renameTag = sinon.stub().callsArg(3);
			this.req = { 
				params: {
					user_id,
					tag_id
				},
				body: {
					name: (this.name = "new-name")
				}
			};
			return this.controller.renameTag(this.req, this.res);
		});
			
		it("should tell the repository to rename the tag", function() {
			return this.tagsRepository.renameTag
				.calledWith(user_id, tag_id, this.name)
				.should.equal(true);
		});
		
		return it("should return a 204 status code", function() {
			this.res.status.calledWith(204).should.equal(true);
			return this.res.end.called.should.equal(true);
		});
	});
});
