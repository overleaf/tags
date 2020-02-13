/* eslint-disable
    camelcase,
    handle-callback-err,
    no-dupe-keys,
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const sinon = require('sinon');
const chai = require('chai');
const {
    expect
} = chai;
const should = chai.should();
const modulePath = "../../../app/js/Repositories/Tags.js";
const SandboxedModule = require('sandboxed-module');
const assert = require('assert');
const {
    ObjectId
} = require("mongojs");

const user_id = "51dc93e6fb625a261300003b";
const tag_name = '123434';
const project_id = "51dc93e6fb625a261300003a";

describe('TagsRepository', function() {
	beforeEach(function() {
		const self = this;
		this.findOneStub = sinon.stub();
		this.findStub = sinon.stub();
		this.saveStub = sinon.stub();
		this.insertStub = sinon.stub().callsArg(1);
		this.updateStub = sinon.stub().callsArg(2);
		this.removeStub = sinon.stub().callsArg(1);
		this.callback = sinon.stub();

		this.mongojs = () => {
			return{ tags: {
				update: self.mongojsUpdate, 
				find: this.findStub,
				findOne: this.findOneStub,
				save: this.saveStub,
				insert: this.insertStub,
				update: this.updateStub,
				remove: this.removeStub
			}
		};
		};
		this.mongojs.ObjectId = ObjectId;

		return this.repository = SandboxedModule.require(modulePath, { requires: {
			'logger-sharelatex': { log() {}
		},
			'settings-sharelatex': {},
			'mongojs':this.mongojs,
			'metrics-sharelatex': {timeAsyncMethod(){}}
		}
	});});

	describe('finding users tags', function() { return it('should find all the documents with that user id', function(done){
        const stubbedTags = [{"name":"tag1"}, {"name":"tag2"}, {"name":"tag3"}];
        this.findStub.callsArgWith(1, null, stubbedTags);
        return this.repository.getUserTags(user_id, (err, result) => {
            result.length.should.equal(3);
            result[0].should.equal(stubbedTags[0]);
            result[1].should.equal(stubbedTags[1]);
            result[2].should.equal(stubbedTags[2]);
            return done();
        });
    }); });

	describe("createTag", function() {
		describe("when insert succeeds", function() {
			beforeEach(function() {
				return this.repository.createTag("user-id", "name", this.callback);
			});

			it("should call insert in mongo", function() {
				return expect(this.insertStub.lastCall.args[0]).to.deep.equal({
					user_id: "user-id",
					name: "name",
					project_ids: []});
		});

			return it("should call the callback", function() {
				return this.callback.called.should.equal(true);
			});
		});

		return describe("when insert has duplicate key error error", function() {
			beforeEach(function() {
				this.duplicateKeyError = new Error("Duplicate");
				this.duplicateKeyError.code = 11000;
				this.insertStub.callsArgWith(1, this.duplicateKeyError);
				this.findOneStub.callsArgWith(1, null, "existing-tag");
				return this.repository.createTag("user-id", "name", this.callback);
			});

			it("should get tag with findOne", function() {
				return expect(this.findOneStub.lastCall.args[0]).to.deep.equal({
					user_id: "user-id",
					name: "name"
				});
			});

			return it("should callback with existing tag", function() {
				return expect(this.callback.lastCall.args[1]).to.equal("existing-tag");
			});
		});
	});

	describe('addProjectToTag', function() {
		describe("with a valid tag_id", function() {
			beforeEach(function() {
				this.updateStub.callsArg(2);
				this.tag_id = ObjectId().toString();
				return this.repository.addProjectToTag(user_id, this.tag_id, project_id, this.callback);
			});

			it("should call update in mongo", function() {
				return expect(this.updateStub.lastCall.args.slice(0,2)).to.deep.equal([
					{
						_id: ObjectId(this.tag_id),
						user_id
					},
					{
						$addToSet: { project_ids: project_id }
					}
				]);
		});

			return it("should call the callback", function() {
				return this.callback.called.should.equal(true);
			});
		});
		
		return describe("with an invalid tag_id", function() {
			beforeEach(function() {
				this.tag_id = "not and object id";
				return this.repository.addProjectToTag(user_id, this.tag_id, project_id, this.callback);
			});
		
			return it("should call the callback with and error", function() {
				return this.callback.calledWith(new Error()).should.equal(true);
			});
		});
	});

	describe('addProjectToTagName', function() {
		beforeEach(function() {
			this.updateStub.callsArg(3);
			return this.repository.addProjectToTagName(user_id, tag_name, project_id, this.callback);
		});

		it("should call update in mongo", function() {
			return expect(this.updateStub.lastCall.args.slice(0,3)).to.deep.equal([
				{
					name: tag_name,
					user_id
				},
				{
					$addToSet: { project_ids: project_id }
				},
				{
					upsert: true
				}
			]);
	});

		return it("should call the callback", function() {
			return this.callback.called.should.equal(true);
		});
	});

	describe('updateTagUserIds', function() {
		beforeEach(function() {
			this.updateStub.callsArg(3);
			return this.repository.updateTagUserIds("old-user-id", "new-user-id", this.callback);
		});

		it("should call update in mongo", function() {
			return expect(this.updateStub.lastCall.args.slice(0,3)).to.deep.equal([
				{
					user_id: "old-user-id"
				},
				{
					$set: { user_id: "new-user-id" }
				},
				{
					multi: true
				}
			]);
	});

		return it("should call the callback", function() {
			return this.callback.called.should.equal(true);
		});
	});

	describe('removeProjectFromTag', function() {
		describe("with a valid tag_id", function() {
			beforeEach(function() {
				this.updateStub.callsArg(2);
				this.tag_id = ObjectId().toString();
				return this.repository.removeProjectFromTag(user_id, this.tag_id, project_id, this.callback);
			});
				
			it("should call update in mongo", function() {
				return expect(this.updateStub.lastCall.args.slice(0,2)).to.deep.equal([
					{
						_id: ObjectId(this.tag_id),
						user_id
					},
					{
						$pull: { project_ids: project_id }
					}
				]);
		});

			return it("should call the callback", function() {
				return this.callback.called.should.equal(true);
			});
		});
		
		return describe("with an invalid tag_id", function() {
			beforeEach(function() {
				this.tag_id = "not and object id";
				return this.repository.removeProjectFromTag(user_id, this.tag_id, project_id, this.callback);
			});
		
			return it("should call the callback with and error", function() {
				return this.callback.calledWith(new Error()).should.equal(true);
			});
		});
	});

	describe('removeProjectFromAllTags', function() { return it('should pull the project id from the tag', function(done){
        this.updateStub.callsArgWith(3, null);
        return this.repository.removeProjectFromAllTags(user_id, project_id, err=> {
            const searchOps = 
                {user_id};
            const insertOperation = 
                {"$pull": {project_ids:project_id}};
            this.updateStub.calledWith(searchOps, insertOperation).should.equal(true);
            return done();
        });
    }); });
	
	describe("deleteTag", function() {
		describe("with a valid tag_id", function() {
			beforeEach(function() {
				this.tag_id = ObjectId().toString();
				return this.repository.deleteTag(user_id, this.tag_id, this.callback);
			});
				
			it("should call remove in mongo", function() {
				return expect(this.removeStub.lastCall.args[0]).to.deep.equal({
					_id: ObjectId(this.tag_id),
					user_id
				});
		});

			return it("should call the callback", function() {
				return this.callback.called.should.equal(true);
			});
		});
		
		return describe("with an invalid tag_id", function() {
			beforeEach(function() {
				this.tag_id = "not and object id";
				return this.repository.deleteTag(user_id, this.tag_id, this.callback);
			});
		
			return it("should call the callback with and error", function() {
				return this.callback.calledWith(new Error()).should.equal(true);
			});
		});
	});

	return describe("renameTag", function() {
		describe("with a valid tag_id", function() {
			beforeEach(function() {
				this.updateStub.callsArg(2);
				this.tag_id = ObjectId().toString();
				this.name = "new-name";
				return this.repository.renameTag(user_id, this.tag_id, this.name, this.callback);
			});
				
			it("should call remove in mongo", function() {
				return expect(this.updateStub.lastCall.args.slice(0, 2)).to.deep.equal([
					{
						_id: ObjectId(this.tag_id),
						user_id
					},
					{
						$set: { name: this.name }
					}
				]);
		});
			
			return it("should call the callback", function() {
				return this.callback.called.should.equal(true);
			});
		});
		
		return describe("with an invalid tag_id", function() {
			beforeEach(function() {
				this.tag_id = "not and object id";
				return this.repository.renameTag(user_id, this.tag_id, "name", this.callback);
			});
		
			return it("should call the callback with and error", function() {
				return this.callback.calledWith(new Error()).should.equal(true);
			});
		});
	});
});

