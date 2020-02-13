/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const metrics = require("metrics-sharelatex");
metrics.initialize("tags");
const Settings = require('settings-sharelatex');
const logger = require('logger-sharelatex');
logger.initialize("tags");
const express = require('express');
const app = express();
const controller = require("./app/js/TagsController");
const Path = require("path");
metrics.memory.monitor(logger);

const HealthCheckController = require("./app/js/HealthCheckController");

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(metrics.http.monitor(logger));
	return app.use(express.errorHandler());
});
metrics.injectMetricsRoute(app);

app.get('/user/:user_id/tag', controller.getUserTags);
app.post('/user/:user_id/tag', controller.createTag);
app.put('/user/:user_id/tag', controller.updateTagUserIds);
app.post('/user/:user_id/tag/:tag_id/rename', controller.renameTag);
app.del('/user/:user_id/tag/:tag_id', controller.deleteTag);
app.post('/user/:user_id/tag/:tag_id/project/:project_id', controller.addProjectToTag);
app.post('/user/:user_id/tag/project/:project_id', controller.addProjectToTagName);
app.del('/user/:user_id/tag/:tag_id/project/:project_id', controller.removeProjectFromTag);
app.del('/user/:user_id/project/:project_id', controller.removeProjectFromAllTags);

app.get('/status', (req, res) => res.send('tags sharelatex up'));

app.get('/health_check', (req, res) => HealthCheckController.check(function(err){
    if (err != null) {
        logger.err({err}, "error performing health check");
        return res.send(500);
    } else {
        return res.send(200);
    }
}));

app.get('*', (req, res) => res.send(404));

const host = __guard__(Settings.internal != null ? Settings.internal.tags : undefined, x => x.host) || "localhost";
const port = __guard__(Settings.internal != null ? Settings.internal.tags : undefined, x1 => x1.port) || 3012;

module.exports = app;

if (!module.parent) {
	app.listen(port, host, () => logger.info(`tags starting up, listening on ${host}:${port}`));
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}