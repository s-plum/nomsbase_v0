var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	compass = require('gulp-compass'),
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch'),
	browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    plumber = require('gulp-plumber'),
    onError = function (err) {  
      console.log(err.toString());
    };

//TODO
//require.js

gulp.task('server', function() {
	nodemon({script: 'app.js'});
});

gulp.task('scripts', function() {
  return browserify('./public/js/src/main.js')
    .bundle()
    .on('error', onError)
    .pipe(source('main.js'))
    .pipe(streamify(ngAnnotate()))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload());
});

gulp.task('scriptWatch', function() {
  gulp.watch('./public/js/src/**/*.js', ['scripts']);
});

gulp.task('sassy', function() {
  gulp.src('./public/css/src/**/*.scss')
    .pipe(watch('./public/css/src/**/*.scss', ['sassy']))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      config_file: 'config.rb',
      css: 'public/css',
      sass: 'public/css/src'
    }))
    .pipe(gulp.dest('public/css'))
    .pipe(livereload());
});
 

gulp.task('ejs', function() {
	gulp.src('./views/**/*.ejs')
		.pipe(watch('./views/**/*.ejs', ['ejs']))
		.pipe(livereload());
});


gulp.task('default', ['scripts', 'scriptWatch', 'ejs', 'sassy' ,'server']);