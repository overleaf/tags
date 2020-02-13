app = require('../../../../app')
settings = require("settings-sharelatex")

module.exports =
	running: false
	initing: false
	callbacks: []
	ensureRunning: (callback = (error) ->) ->
		if @running
			return callback()
		else if @initing
			@callbacks.push callback
		else
			@initing = true
			@callbacks.push callback
			app.listen settings.internal.tags.port, settings.internal.tags.host, (error) =>
				throw error if error?
				@running = true
				for callback in @callbacks
					callback()
