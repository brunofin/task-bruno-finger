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
  exec = require('child_process').exec,
  mainBowerFiles = require('main-bower-files'),
  angularFilesort = require('gulp-angular-filesort'),
  es = require('event-stream');

  gulp.task('runserver', ['prepare-files'], function (cb) {
    exec('node node_modules/http-server/bin/http-server ./src -o', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });

  gulp.task('runserver:dist', function (cb) {
    exec('node node_modules/http-server/bin/http-server ./dist -o', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });

gulp.task('prepare-files', ['fixjsstyle', 'fixscssstyle', 'fixhtmlstyle',
    'minify-js:debug', 'inject-dependencies:debug']);


/** Automatically formats EVERY JS file */
gulp.task('fixjsstyle', function() {
  gutil.log('Formatting JavaScript source-code...');

  return gulp.src('src/js/**/*.js')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/js'));
});

gulp.task('fixscssstyle', function() {
  gutil.log('Formatting SCSS source-code...');

  return gulp.src('src/scss/**/*.scss')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/scss'));
});

gulp.task('fixhtmlstyle', function() {
  gutil.log('Formatting HTML source-code...');

  return gulp.src('src/partials/**/*.html')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/partials'));
});


var minifyScss = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Generating CSS, debug: ' + debug);

  var stream = gulp.src((debug ? 'src/scss/styles.scss' : 'dist/scss/dist-deps.scss'));

  if (debug) {
    stream = stream.pipe(sourcemaps.init());
  }

  stream = stream.pipe(sass({
    style: (debug ? 'expanded' : 'compressed')
  }).on('error', sass.logError));

  stream = stream.pipe(rename('styles.min.css'));

  if (debug) {
    stream = stream.pipe(sourcemaps.write('.'));
  }

  stream = stream.pipe(gulp.dest(debug ? 'src/' : 'dist/'));

  return stream;
}

gulp.task('minify-css:debug', function() {
  return minifyScss(true);
});

var minifyJs = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Generating JS, debug: ' + debug);
  var sources = mainBowerFiles().filter(function(value) {
    return value.indexOf('.js') > -1;
  }).map(function(lib) {
    return (debug ? lib : lib.replace('src', 'dist'));
  }).concat((debug ? 'src/' : 'dist/') + 'js/**/*.js');

  var compilerFlags = {
    compilation_level: "WHITESPACE_ONLY", // https://github.com/steida/gulp-closure-compiler/blob/master/flags.txt#L31
    logging_level: 'OFF', // https://docs.oracle.com/javase/7/docs/api/java/util/logging/Level.html
    summary_detail_level: 0, // https://github.com/steida/gulp-closure-compiler/blob/master/flags.txt#L259
    warning_level: 'QUIET', // https://github.com/steida/gulp-closure-compiler/blob/master/flags.txt#L295
    language_in: 'ECMASCRIPT5', // https://github.com/steida/gulp-closure-compiler/blob/master/flags.txt#L145
    create_source_map: './src/app.min.js.map'
  };

  return gulp.src(sources)
    .pipe(closureCompiler({
      compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
      fileName: (debug ? 'src/' : 'dist/') + 'app.min.js',
      continueWithWarnings: true,
      compilerFlags: compilerFlags
    }))
    .pipe(gulp.dest('.'));
}

gulp.task('minify-js:debug', function() {
  return minifyJs(true);
});

var injectDependencies = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Injecting dependencies into index.html, debug: ' + debug);

  var target = gulp.src((debug ? 'src/' : 'dist/') + 'index.src.html');
  var sourcesJS = null, sourcesCSS = null

  if (debug) {
    sourcesJS = gulp.src(mainBowerFiles().filter(function(value) {
      return value.indexOf('.js') > -1;
    }).concat('src/js/**/*.js'));

    sourcesCSS = gulp.src(mainBowerFiles().filter(function(value) {
      return value.indexOf('.css') > -1;
    }).concat('src/styles.min.css'), {read: false});
  } else {
    sourcesJS = gulp.src('dist/app.min.js');
    sourcesCSS = gulp.src('dist/styles.min.css',{read: false});
  }

  return target.pipe(rename('index.html'))
    .pipe(inject(es.merge(sourcesJS, sourcesCSS), {
      relative: true,
      transform: function (filepath) {
        // arguments[0] = '/static/' + arguments[0];
        return inject.transform.apply(inject.transform, arguments);
      }
    }))
    .pipe(gulp.dest(debug ? 'src/' : 'dist/'));
}

gulp.task('inject-dependencies:debug', ['minify-css:debug'], function() {
  return injectDependencies(true);
})


gulp.task('prepare-deploy', function() {
  return gulp.src('src/**/*.*').pipe(gulp.dest('dist/'));
});

gulp.task('minify-css', ['prepare-deploy'], function() {
  return minifyScss();
});

gulp.task('minify-js', ['minify-css'], function() {
  return minifyJs();
});

gulp.task('inject-dependencies', ['minify-js'], function() {
  return injectDependencies();
})

gulp.task('clean', ['inject-dependencies'], function() {
  return gulp.src([
      'dist/bower_components',
      'dist/*.map',
      'dist/index.src.html',
      'dist/js',
      'dist/scss'
    ], {
      read: false
    })
    .pipe(clean());
});

gulp.task('deploy', ['clean'], function() {
  gutil.log('Deployed files to "./dist".');
});
