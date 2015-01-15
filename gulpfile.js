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
  onError = function (err) {  
    console.log(err.toString());
  },
  srcPath = 'src';
  distPath = 'dist';
  srcPaths = {
    css: srcPath + '/css/**/*.css',
    sass: srcPath + '/css/src/**/*.scss',
    ejs: srcPath + '/views/**/*.ejs',
    img: srcPath + '/img/**/*',
    js: srcPath + '/js/**/*.js'
  },
  distPaths = {
    css: distPath + '/css',
    ejs: distPath + '/views',
    img: distPath + '/img',
    js: distPath + '/js'
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

gulp.task('watch:ejs', function() {
  watch(srcPaths.ejs, function(files, cb) {
    gulp.start('ejs', cb);
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

gulp.task('watch', ['watch:scripts','watch:ejs','watch:images','watch:sass']);

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
    //.pipe(watch(srcPaths.sass))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      config_file: 'config.rb',
      css: srcPath + '/css',
      sass: srcPath + '/css/src'
    }))
    .pipe(rename('main.css'))
    .pipe(gulp.dest(distPath + '/css'))
    .pipe(livereload());
});
 

gulp.task('ejs', function() {
	gulp.src(srcPaths.ejs)
		.pipe(plumber({
      errorHandler: onError
    }))
    .pipe(gulp.dest(distPaths.ejs))
		.pipe(livereload());
});

gulp.task('images', ['clean:images'], function() {
  gulp.src(srcPaths.img)
    .pipe(gulp.dest(distPaths.img))
    .pipe(livereload());
});


gulp.task('default', ['scripts', 'ejs', 'sassy', 'images', 'watch' ,'server']);