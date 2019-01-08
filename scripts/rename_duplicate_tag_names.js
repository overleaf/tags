const Settings = require("settings-sharelatex")
const _ = require("underscore")
const async = require("async")
const mongojs = require("mongojs")
const mongoUrl = process.env["MONGO_URL"] || Settings.mongo.url
const db = mongojs(mongoUrl, ["tags"])

const commit = process.argv[2] === "commit"

if (!commit) {
	console.log("DRY RUN: to commit changes run: node rename_duplicate_tag_names commit")
}

db.tags.distinct("user_id", {}, function (err, user_ids) {
	if (err) throw err
	console.log("checking "+user_ids.length+" users for duplicate tags")
	const chunks = []
	while (user_ids.length) {
		chunks.push( user_ids.splice(0, 500) )
	}
	async.mapSeries(chunks, processUsers, function (err) {
		if (err) throw err
		console.log("DONE")
		db.close()
	})
})

function processUsers(user_ids, callback) {
	db.tags.aggregate([
		{ $match: { user_id: { $in: user_ids } } },
		{ $group: { _id: "$user_id", tags: { $push: "$$ROOT" } } },
	], function (err, tags) {
		if (err) throw err
		async.mapSeries(tags, processUser, callback)
	})
}

function processUser (userTags, callback) {
	const tagsByName = _.groupBy(userTags.tags, "name")
	const duplicateTags = []
	_.forEach(tagsByName, function (tags) {
		if (tags.length > 1) duplicateTags.push(tags)
	})
	if (duplicateTags.length === 0) return callback()
	console.log("found "+duplicateTags.length+" duplicate tags for user "+userTags._id)
	async.mapSeries(duplicateTags, renameDuplicateTags, callback)
}

function renameDuplicateTags (duplicateTags, callback) {
	// get tags sorted by those with the largest number of tagged projects first
	duplicateTags = _.sortBy(duplicateTags, function (tag) { return tag.project_ids.length }).reverse()
	// rename all tags except the first
	let tagNum = 1
	async.mapSeries(duplicateTags.slice(1), function (duplicateTag, callback) {
		renameDuplicateTag(duplicateTag, tagNum++, callback)
	}, callback)
}

function renameDuplicateTag (duplicateTag, tagNum, callback) {
	const newTagName = duplicateTag.name+ " "+tagNum
	console.log("renaming tag "+duplicateTag._id+" for user "+duplicateTag.user_id+" to "+newTagName)
	if (!commit) return callback()
	db.tags.update({_id: duplicateTag._id}, { $set: {name: newTagName} }, callback)
}
