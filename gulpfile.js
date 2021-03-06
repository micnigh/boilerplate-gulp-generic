var browsersync = require("browser-sync");
var argv = require("yargs").argv;
var gulp = require("gulp");
var nodemon = require("gulp-nodemon");
var karma = require("karma");

var gft = require("gulp-frontend-tasks")(gulp);

require("regenerator/runtime");
require("babel-core/register")({
  presets: ["babel-preset-es2015"],
  plugins: ["syntax-async-functions", "transform-regenerator"],
});

process.env.NODE_ENV = process.env.NODE_ENV || "development";

var bsApp = browsersync.create();
var bsTest = browsersync.create();

var distPath = "server/public";
var testPath = ".tmp/test/";

var karmaPort = 3001;
var bsAppPort = 3002;
var bsTestPort = 3004;

var libs = [
  "underscore",
  "es5-shim/es5-shim",
  "es5-shim/es5-sham",
  "bluebird",
  "regenerator/runtime",
];

var testLibs = [
  "chai",
];

gft.generateTask("js", {
  taskName: "lib",
  entries: [
    "client/js/libs/entry.js",
  ],
  includes: [
    "client/js/libs",
  ],
  dest: distPath + "/js/",
  destFileName: "lib.js",
  browserify: {
    requires: libs,
    transforms: {
      babelify: {
        presets: [
          require("babel-preset-es2015")
        ],
      },
    },
  },
  watch: [
    "client/js/libs/entry.js",
  ],
  browsersync: bsApp,
});

gft.generateTask("js", {
  taskName: "app",
  entries: [
    "client/js/src/*.js",
  ],
  dest: distPath + "/js/",
  includes: [
    "client/js/src",
  ],
  browserify: {
    externals: libs,
    transforms: {
      babelify: {
        presets: [
          require("babel-preset-es2015"),
        ],
        plugins: [
          require("babel-plugin-transform-regenerator"),
          require("babel-plugin-syntax-async-functions"),
        ],
      },
    },
  },
  watch: [
    "client/js/src/*.js",
  ],
  browsersync: bsApp,
});

gft.generateTask("js", {
  taskName: "testLib",
  entries: [
    "client/js/test/libs/entry.js",
  ],
  includes: [
    "client/js/test/libs",
  ],
  dest: testPath + "/js/",
  destFileName: "testLib.js",
  browserify: {
    requires: testLibs,
    transforms: {
      babelify: {
        presets: [
          require("babel-preset-es2015"),
        ],
      },
    },
  },
  watch: [
    "client/js/test/libs/entry.js",
  ],
  browsersync: bsTest,
});

gft.generateTask("js", {
  taskName: "test",
  entries: [
    "client/js/test/src/**/*.js",
  ],
  dest: testPath + "/js/",
  includes: [
    "client/js/test/src",
    "client/js/src",
  ],
  browserify: {
    externals: libs.concat(testLibs),
    transforms: {
      babelify: {
        presets: [
          require("babel-preset-es2015"),
        ],
        plugins: [
          require("babel-plugin-transform-regenerator"),
          require("babel-plugin-syntax-async-functions"),
        ],
      },
    },
  },
  watch: [
    "client/js/test/src/**/*.js",
  ],
  browsersync: bsTest,
});

gulp.task("build:js", [
  "build:js:lib",
  "build:js:app",
  "build:js:test",
]);

gulp.task("watch:js", [
  "watch:js:lib",
  "watch:js:app",
  "watch:js:test",
]);

gft.generateTask("css:scss", {
  taskName: "app",
  entries: [
    "client/css/src/*.scss",
  ],
  includes: [
    "client/css/src/",
    "node_modules/",
  ],
  dest: distPath + "/css/",
  watch: [
    "client/css/src/**/*.scss",
    "!client/css/src/shared/sprites.*",
  ],
  dependsOn: [
    "build:spritesheet:app",
  ],
  browsersync: bsApp,
});

gulp.task("build:css", [
  "build:css:scss:app",
]);

gulp.task("watch:css", [
  "watch:css:scss:app",
]);

gft.generateTask("spritesheet", {
  taskName: "app",
  src: "client/sprites/*.png",
  dest: distPath + "/css/",
  destFileName: "spritesheet_",
  spriteCSSFile: "client/css/src/shared/sprites.scss",
  buildCSSTask: "build:css:scss:app",
  watch: [
    "client/sprites/*.png",
  ],
});

gulp.task("build:spritesheet", [
  "build:spritesheet:app",
]);

gulp.task("watch:spritesheet", [
  "watch:spritesheet:app",
]);

gulp.task("build", [
  "build:js",
  "build:css",
  "build:spritesheet",
]);

gulp.task("serve", [], function () {
  nodemon({
    watch: [
      "server",
    ],
    ignore: [
      "server/public/js/*.js*",
      "server/public/css/*.css*",
    ],
    script: "server/index.js",
    ext: "js",
  });
});

gulp.task("test:browser", [
  "build:js:testLib",
  "build:js:test",
], function (done) {
  new karma.Server({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done).start();
});

gulp.task("watch:test:browser", [
  "build:js:testLib",
  "build:js:test",
], function (done) {
  new karma.Server({
    configFile: __dirname + "/karma.conf.js",
    singleRun: false
  }, done).start();
});

require("./tasks/test/node").generateTask({
  taskName: "test:node",
});

require("./tasks/watch/test/node").generateTask({
  taskName: "watch:test:node",
  dependsOn: [ "test:node" ],
});

gulp.task("test", [
  "test:browser",
  "test:node",
]);

gulp.task("watch:test", [
  "watch:test:browser",
  "watch:test:node",
]);

gulp.task("watch:initBrowserify", [
  "watch:initBrowserify:app",
  "watch:initBrowserify:test",
]);

gulp.task("watch:initBrowserify:app", function (done) {
  bsApp.init({
    logSnippet: false,
    open: false,
    notify: false,
    port: bsAppPort,
    ui: {
      port: bsAppPort + 1,
    },
  }, done);
});

gulp.task("watch:initBrowserify:test", function (done) {
  bsTest.init({
    logSnippet: false,
    open: false,
    notify: false,
    port: bsTestPort,
    ui: {
      port: bsTestPort + 1,
    },
  }, done);
});

gulp.task("watch", [
  "watch:js",
  "watch:css",
  "watch:spritesheet",
  "watch:initBrowserify",
  "serve",
  "watch:test",
]);

gulp.task("default", ["watch"]);

module.exports = {
  distPath: distPath,
  testPath: testPath,
  karmaPort: karmaPort,
};
