var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	compass = require('gulp-compass'),
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch'),
  gulpIf = require('gulp-if'),
  rename = require('gulp-rename'),
	browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  plumber = require('gulp-plumber'),
  del = require('del'),
  autoprefixer = require('gulp-autoprefixer'),
  argv = require('yargs').argv,
  srcPath = 'src';
  distPath = 'dist';
  srcPaths = {
    css: srcPath + '/css/**/*.css',
    sass: srcPath + '/css/src/**/*.scss',
    html: srcPath + '/*.html',
    img: srcPath + '/img/**/*',
    js: srcPath + '/js/**/*.js',
    templates: srcPath + '/templates/**/*.html'
  },
  distPaths = {
    css: distPath + '/css',
    html: distPath + '/',
    img: distPath + '/img',
    js: distPath + '/js',
    templates: distPath + '/templates'
  };

var environments = {
  dev: {
    tasks: ['scripts', 'templates', 'html', 'sassy', 'images', 'watch' ,'server'],
    nodeArgs: ['--debug']
  },
  prod: {
    tasks: ['scripts', 'templates', 'html', 'sassy', 'images', 'server'],
    nodeArgs: []
  }
}

var config = {
  port: 3000,
  env: argv.env || argv.e || 'dev',
  errorHandler: function(err) {
    console.log(err.toString())
  }
};

gulp.task('server', function() {
	nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': config.env }
  });
});

gulp.task('watch:scripts', function() {
  watch([srcPaths.js, "!" + srcPath + '/js/config.js'], function(files, cb) {
    gulp.start('scripts', cb);
  });
});

gulp.task('watch:templates', function() {
  watch(srcPaths.templates, function(files, cb) {
    gulp.start('templates', cb);
  });
});

gulp.task('watch:html', function() {
  watch(srcPaths.html, function(files, cb) {
    gulp.start('html', cb);
  });
});

gulp.task('watch:images', function() {
  watch([srcPath + '/img', srcPath + '/img/**/*.jpg', srcPath + '/img/**/*.png', srcPath + '/img/**/*.gif', srcPath + '/img/**/*.svg'], function(files, cb) {
    gulp.start('images', cb);
  });
});

gulp.task('watch:sass', function() {
  watch(srcPaths.sass, function(files, cb) {
    gulp.start('sassy', cb);
  });
});

gulp.task('watch', ['watch:scripts','watch:templates', 'watch:html','watch:images','watch:sass']);

gulp.task('clean:images', function (cb) {
  del([distPaths.img + '/*'], cb)
});

gulp.task('scripts', ['browserify'], function(cb) {
  del([srcPath + '/js/config.js'], cb);
});

gulp.task('browserify', function() {
  return browserify('./src/js/main.js')
    .bundle()
    .on('error', config.errorHandler)
    .pipe(source('main.js'))
    .pipe(streamify(ngAnnotate()))
    .pipe(gulpIf(config.env === 'prod', streamify(uglify({mangle: false}))))
    .pipe(gulp.dest(distPath + '/js'))
    .pipe(gulpIf(config.env === 'dev', livereload()));
});

gulp.task('sassy', function() {
  gulp.src(srcPaths.sass)
    .pipe(plumber({
      errorHandler: config.errorHandler
    }))
    .pipe(compass({
      config_file: 'config.rb',
      css: srcPath + '/css',
      sass: srcPath + '/css/src'
    }))
    .pipe(rename('main.css'))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest(distPath + '/css'))
    .pipe(gulpIf(config.env === 'dev', livereload()));
});

gulp.task('templates', function() {
	gulp.src(srcPaths.templates)
		.pipe(plumber({
      errorHandler: config.errorHandler
    }))
    .pipe(gulp.dest(distPaths.templates))
	.pipe(gulpIf(config.env === 'dev', livereload()));
});

gulp.task('html', function() {
  gulp.src(srcPaths.html)
    .pipe(plumber({
      errorHandler: config.errorHandler
    }))
    .pipe(gulp.dest(distPaths.html))
    .pipe(gulpIf(config.env === 'dev', livereload()));
});

gulp.task('images', ['clean:images'], function() {
  gulp.src(srcPaths.img)
    .pipe(gulp.dest(distPaths.img))
    .pipe(gulpIf(config.env === 'dev', livereload()));
});

gulp.task('default', environments[config.env].tasks);