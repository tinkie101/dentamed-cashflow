const stringReplacer = require("../node_modules/@ui5/cli/node_modules/@ui5/builder/lib/processors/stringReplacer.js");

module.exports = function({workspace, options}) {
	return workspace.byGlob("/**/manifest.json")
		.then((processedResources) => {
			return stringReplacer({
				resources: processedResources,
				options: {
					pattern: /http:\/\/localhost:8082\/proxy\/http\/localhost:8080\//g,
					replacement: "/java/"
				}
			});
		})
		.then((processedResources) => {
			return Promise.all(processedResources.map((resource) => {
				return workspace.write(resource);
			}));
		});
};
