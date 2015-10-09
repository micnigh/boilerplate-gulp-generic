require("es5-shim/es5-shim");
require("es5-shim/es5-sham");

window._ = require("underscore");

if (process.env.BROWSERSYNC_ENABLED === "true") {
  document.write(process.env.BROWSERSYNC_SNIPPET);
}
