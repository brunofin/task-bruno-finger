var gulp = require('gulp'),
  gutil = require('gulp-util'),
  sass = require('gulp-sass'),
  prettify = require('gulp-jsbeautifier'),
  closureCompiler = require('gulp-closure-compiler'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  clean = require('gulp-clean'),
  inject = require('gulp-inject'),
  path = require('path'),
  exec = require('child_process').exec;

gulp.task('runserver', function(cb) {
  var proc = exec(
    'source .node-virtualenv/bin/activate;' +
    './src/cloud/manage.py migrate;' +
    './src/cloud/manage.py flush --noinput;' +
    './src/cloud/manage.py loaddata initial_data.json;' +
    './src/cloud/manage.py runserver;'
  );
  proc.stderr.on('data', function(data) {
    gutil.log(data);
  });

  proc.stdout.on('data', function(data) {
    gutil.log(data);
  });

  proc.on('close', function (code) {
    gutil.log('my-task exited with code ' + code);
    cb(code);
  });
});

gulp.task('runserver:dist', function(cb ) {
  var child = env.spawnPython(['./src/cloud/manage.py', 'runserver']);

  child.stdout.on('data', function(data) {
    gutil.log(data.toString());
  });

  child.on('close', function (code) {
    gutil.log('my-task exited with code ' + code);
    cb(code);
  });
});
