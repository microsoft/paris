const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');

gulp.task('build', ["clean"], function() {
	const merge = require('merge2');
	const tsProject = ts.createProject('tsconfig.json');

	var tsResult = tsProject.src()
		.pipe(tsProject());

	return merge([
		tsResult.dts
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir)),
		tsResult.js
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
	]);
});

gulp.task('clean', function () {
	return gulp.src('bundle', { read: false })
		.pipe(clean());
});

gulp.task('watch', ['default'], function() {
	gulp.watch('src/*.ts', ['default']);
});

gulp.task('default', [], function(cb) {
	runSequence('clean', 'build', cb);
});
