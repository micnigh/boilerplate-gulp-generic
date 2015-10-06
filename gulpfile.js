var _ = require("underscore");
var argv = require("yargs").argv;
var gulp = require("gulp");

var gft = require("gulp-frontend-tasks")(gulp);

var buildEnv = process.env.BUILD_ENV;
if (typeof process.env.BUILD_ENV === "undefined"){
  buildEnv = "development";
  buildEnv = argv.production ? "production" : buildEnv;
}

_.extend(process.env, {
  BUILD_ENV: buildEnv,
});

var distPath = "server/public";

var libs = [
  "underscore",
  "es5-shim/es5-shim",
  "es5-shim/es5-sham",
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
  },
  watch: [
    "client/js/libs/entry.js",
  ],
});

gft.generateTask("js", {
  taskName: "app",
  entries: [
    "client/js/src/*.js",
  ],
  dest: distPath + "/js/",
  includes: [
    "client/js",
  ],
  browserify: {
    externals: libs,
  },
  watch: [
    "client/js/src/*.js",
  ],
});

gulp.task("build:js", [
  "build:js:lib",
  "build:js:app",
]);

gulp.task("watch:js", [
  "watch:js:lib",
  "watch:js:app",
]);

gft.generateTask("css:less", {
  taskName: "app",
  entries: [
    "client/css/src/*.less",
  ],
  includes: [
    "client/css/src/",
    "node_modules/",
  ],
  dest: distPath + "/css/",
  watch: [
    "client/css/src/**/*.less",
  ],
  dependsOn: [
    "build:spritesheet:less:app",
  ]
});

gulp.task("build:css", [
  "build:css:less:app",
]);

gulp.task("watch:css", [
  "watch:css:less:app",
]);

gft.generateTask("spritesheet:less", {
  taskName: "app",
  src: "client/sprites/*.png",
  dest: distPath + "/css/",
  destFileName: "spritesheet_",
  lessSpriteFile: "client/css/src/shared/sprites.less",
  watch: [
    "client/sprites/*.png",
  ],
});

gulp.task("build:spritesheet", [
  "build:spritesheet:less:app",
]);

gulp.task("watch:spritesheet", [
  "watch:spritesheet:less:app",
]);

gulp.task("build", [
  "build:js",
  "build:css",
  "build:spritesheet",
]);

gulp.task("watch", [
  "watch:js",
  "watch:css",
  "watch:spritesheet",
]);

gulp.task("default", ["watch"]);
