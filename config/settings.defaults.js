module.exports = Settings =
	internal:
		tags:
			port: 3012
			host: process.env["LISTEN_ADDRESS"] or "localhost"

	mongo:
		url: process.env['MONGO_CONNECTION_STRING'] or "mongodb://#{process.env["MONGO_HOST"] or "localhost"}/sharelatex"

	tags:
		healthCheck:
			user_id: "5620bece05509b0a7a3cbc62"


