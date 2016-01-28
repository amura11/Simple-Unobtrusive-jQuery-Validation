var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    bump = require('gulp-bump'),
    jshint = require('gulp-jshint'),
    runSequence = require('run-sequence');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('./src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('master', function(){
    return gulp.src(['./src/core.js', './src/frameworks/**/adaptor.js'])
        .pipe(concat('jquery.sujv.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.sujv.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

/*
 * Builds a version of the juval library specifically for jQuery Validation Plugin
 */
gulp.task('jquery-validation', function(){
    return gulp.src([
        './src/core.js',
        './src/frameworks/jquery-validation/adaptor.js',
        './src/frameworks/jquery-validation/setter.js'
        ])
        .pipe(concat('jquery.sujv.jquery-validation.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.sujv.jquery-validation.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('semantic-ui', function(){
    return gulp.src([
        './src/core.js',
        './src/frameworks/semantic-ui/adaptor.js',
        './src/frameworks/semantic-ui/setter.js'
        ])
        .pipe(concat('jquery.sujv.semantic-ui.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.sujv.semantic-ui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task("bump-major", function (){
    return gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "major" }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump-minor", function (){
    return gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "minor" }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump-patch", function (){
    return gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "patch" }))
        .pipe(gulp.dest("./"));
});

gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['lint', 'master']);
});

gulp.task('build', ['lint', 'master', 'jquery-validation', 'semantic-ui']);

gulp.task('default', ['lint', 'master', 'jquery-validation', 'semantic-ui', 'watch']);
