const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const merge = require('merge2');

function cleanTask() {
	const tsProject = ts.createProject('tsconfig.lib.json');

	return gulp.src(tsProject.config.compilerOptions.outDir, { read: false, allowEmpty: true })
		.pipe(clean());
}

function build() {
	const tsProject = ts.createProject('tsconfig.lib.json');

	const tsResult = tsProject.src()
		.pipe(tsProject());

	return merge([
		tsResult.dts
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir)),
		tsResult.js
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
	]);
}

gulp.task('clean', cleanTask);
gulp.task('build', gulp.series('clean', build));
gulp.task('default', gulp.task('build'));
gulp.task('watch', gulp.series('default'), () => gulp.watch('src/*.ts', ['default']));