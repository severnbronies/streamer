var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");

gulp.task("default", function() {
	gulp.watch("./assets/scss/{,*/}*.scss", ["stylesheets"]);
	gulp.watch("./assets/js/vendor/{,*/}*.js", ["scripts-vendor"]);
	gulp.watch("./assets/js/bristolbronies/{,*/}*.js", ["scripts-bristolbronies"]);
});

gulp.task("stylesheets", function() {
	gulp.src("./assets/scss/bristolbronies.scss")
	.pipe(sass(
		{
			errLogToConsole: true,
			outputStyle: "compressed"
		}
	))
	.pipe(autoprefixer(
		{
			browsers: ['last 2 version', 'ie 8', 'ie 9', 'ie 10'],
			cascade: false
		}
	))
	.pipe(gulp.dest("./assets/css"))
});

gulp.task("scripts-vendor", function() {
	gulp.src(
		[
			"./assets/js/vendor/jquery-1.11.2.min.js",
			"./assets/js/vendor/*.js"
		]
	)
	.pipe(uglify())
	.pipe(concat("vendor.min.js"))
	.pipe(gulp.dest("./assets/js"))
});

gulp.task("scripts-bristolbronies", function() {
	gulp.src(
		[
			"./assets/js/bristolbronies/bb.js",
			"./assets/js/bristolbronies/*.js"
		]
	)
	.pipe(uglify())
	.pipe(concat("bristolbronies.min.js"))
	.pipe(gulp.dest("./assets/js"))
});

gulp.task("images", function() {
	gulp.src(["./assets/images/*", "!./assets/images/*.svg"])
	.pipe(imagemin(
		{
			optimizationLevel: 5,
			progressive: true, // jpg
			interlaced: true, // gif 
			multipass: true // svg
		}
	))
	.pipe(gulp.dest("./assets/images"))
});