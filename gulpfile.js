var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var fileinclude = require('gulp-file-include');
var src = 'app';
var dst = 'dist';

gulp.task('styles', function() {
    gulp.src(src+'/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
		.pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dst+'/css/'))
		.pipe(connect.reload());
});
gulp.task('html', function() {
    gulp.src(src+'/*.html')
        .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
        .pipe(gulp.dest(dst+"/"))
		.pipe(connect.reload());
});

gulp.task('reloadHTML', function() {
  return gulp.src(dst+'/**/*.html')
	.pipe(connect.reload());
});

//Watch task
gulp.task('default',function() {
	connect.server({ root: dst,
    livereload: true,
	port: 8888});
	gulp.watch(src+'/**/*.html', ['html']);
    gulp.watch(src+'/scss/**/*', ['styles']);
});