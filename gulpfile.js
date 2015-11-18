var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    bump = require('gulp-bump'),
    jshint = require('gulp-jshint');

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
    return gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('master', function(){
    gulp.src(['./src/juval.core.js', './src/juval.adaptor.*.js'])
        .pipe(concat('jquery.uval.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.uval.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

/*
 * Builds a version of the juval library specifically for jQuery Validation Plugin
 */
gulp.task('validation-plugin', function(){
    gulp.src([
        './src/juval.core.js',
        './src/juval.adaptor.validation-plugin.js',
        './src/juval.setter.validation-plugin.js'
        ])
        .pipe(concat('jquery.uval.validation-plugin.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.uval.validation-plugin.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('semantic-ui', function(){
    gulp.src([
        './src/juval.core.js',
        './src/juval.adaptor.semantic-ui.js',
        './src/juval.setter.semantic-ui.js'
        ])
        .pipe(concat('jquery.uval.semantic-ui.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jquery.uval.semantic-ui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task("bump-major", function (){
    gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "major" }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump-minor", function (){
    gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "minor" }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump-patch", function (){
    gulp.src(["./bower.json", "./package.json"])
        .pipe(bump({ type: "patch" }))
        .pipe(gulp.dest("./"));
});

gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['lint', 'master']);
});

gulp.task('build-patch', ['master', 'validation-plugin', 'semantic-ui', 'bump-patch']);
gulp.task('build-minor', ['master', 'validation-plugin', 'semantic-ui', 'bump-minor']);
gulp.task('build-major', ['master', 'validation-plugin', 'semantic-ui', 'bump-major']);

gulp.task('default', ['lint', 'master', 'validation-plugin', 'semantic-ui', 'watch']);
