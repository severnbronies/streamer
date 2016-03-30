var gulp = require("gulp");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var imagemin = require("gulp-imagemin");

gulp.task("default", function() {
	gulp.watch("./src/scss/{,*/}*.scss", ["stylesheets"]);
	gulp.watch("./src/js/{,*/}*.js", ["scripts"]);
});

gulp.task("force", ["stylesheets", "scripts", "images"]);

gulp.task("stylesheets", function() {
	gulp.src("./src/scss/stylesheet.scss")
	.pipe(sass(
		{
			errLogToConsole: true,
			outputStyle: "compressed"
		}
	))
	.pipe(gulp.dest("./dst/css"))
});

gulp.task("scripts", function() {
	gulp.src("./src/js/vendor/{,*/}*.js")
	.pipe(uglify())
	.pipe(concat("scripts.js"))
	.pipe(gulp.dest("./dst/js"))
});

gulp.task("images", function() {
	gulp.src("./src/images/{,*/}*")
	.pipe(newer("./dst/images"))
	.pipe(imagemin(
		{
			optimizationLevel: 5,
			progressive: true, // jpg
			interlaced: true, // gif 
			multipass: true // svg
		}
	))
	.pipe(gulp.dest("./dst/images"))
});