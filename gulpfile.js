var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	compass = require('gulp-compass'),
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch'),
  rename = require('gulp-rename'),
	browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  plumber = require('gulp-plumber'),
  del = require('del'),
  autoprefixer = require('gulp-autoprefixer')
  onError = function (err) {  
    console.log(err.toString());
  },
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

gulp.task('server', function() {
	nodemon({script: 'app.js'});
});

gulp.task('watch:scripts', function() {
  watch(srcPaths.js, function(files, cb) {
    gulp.start('scripts', cb);
  });
  gulp.watch('', ['scripts']);
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

gulp.task('scripts', function() {
  return browserify('./src/js/main.js')
    .bundle()
    .on('error', onError)
    .pipe(source('main.js'))
    .pipe(streamify(ngAnnotate()))
    //.pipe(streamify(uglify()))
    .pipe(gulp.dest(distPath + '/js'))
    .pipe(livereload());
});

gulp.task('sassy', function() {
  gulp.src(srcPaths.sass)
    .pipe(plumber({
      errorHandler: onError
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
    .pipe(livereload());
});
 

gulp.task('templates', function() {
	gulp.src(srcPaths.templates)
		.pipe(plumber({
      errorHandler: onError
    }))
    .pipe(gulp.dest(distPaths.templates))
		.pipe(livereload());
});

gulp.task('html', function() {
  gulp.src(srcPaths.html)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(gulp.dest(distPaths.html))
    .pipe(livereload());
});

gulp.task('images', ['clean:images'], function() {
  gulp.src(srcPaths.img)
    .pipe(gulp.dest(distPaths.img))
    .pipe(livereload());
});

gulp.task('default', ['scripts', 'templates', 'html', 'sassy', 'images', 'watch' ,'server']);