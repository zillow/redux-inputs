var gulp = require('gulp'),
	babel = require('gulp-babel'),
	eslint = require('gulp-eslint');

var libDir = 'lib/';

gulp.task('clean', function () {
	return del(libDir);
});

gulp.task('eslint', function () {
	return gulp.src('src/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('build', function () {
	return gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['es2015', 'react'],
			plugins: ['transform-runtime'] // For Promise
		}))
		.pipe(gulp.dest(libDir));
});

gulp.task('default', ['eslint', 'build']);
