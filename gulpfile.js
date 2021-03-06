// Include gulp
var gulp = require('gulp');

// Include dependencies
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('static/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
/*
gulp.task('sass', function() {
    return gulp.src('static/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('static/css'));
});
*/

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('static/app/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('static/dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify()).on('error', errorHandler)
        .pipe(gulp.dest('static/dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('static/app/**/*.js', ['lint', 'scripts']);
    //gulp.watch('static/scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', /*'sass',*/ 'scripts', 'watch']);

// Handle the error
function errorHandler (error) {
 	console.log(error.toString());
 	this.emit('end');
}