const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');

gulp.task('build', ["clean"], function() {
	const tsProject = ts.createProject('tsconfig.json');

	const merge = require('merge2');

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
	const tsProject = ts.createProject('tsconfig.json');

	return gulp.src(tsProject.config.compilerOptions.outDir, { read: false })
		.pipe(clean());
});

gulp.task('watch', ['default'], function() {
	gulp.watch('src/*.ts', ['default']);
});

gulp.task('default', [], function(cb) {
	runSequence('clean', 'build', cb);
});
