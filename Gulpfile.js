var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var imagemin = require("gulp-imagemin");
var plumber = require("gulp-plumber");

gulp.task("default", function() {
	gulp.watch("./src/scss/{,*/}*.scss", ["stylesheets"]);
	gulp.watch("./src/js/{,*/}*.js", ["scripts-streamer", "scripts-player", "scripts-admin"]);
});

gulp.task("force", ["stylesheets", "scripts-streamer", "scripts-player", "scripts-admin", "images"]);

gulp.task("stylesheets", function() {
	gulp.src("./src/scss/*.scss")
	.pipe(plumber())
	.pipe(sass(
		{
			errLogToConsole: true,
			outputStyle: "compressed"
		}
	))
	.pipe(autoprefixer(
		{
			browsers: ['last 2 version'],
			cascade: true
		}
	))
	.pipe(gulp.dest("./dst/css"))
});

gulp.task("scripts-streamer", function() {
	gulp.src(["./src/js/vendor/{,*/}*.js", "./src/js/streamer/{,*/}*.js"])
	.pipe(plumber())
	.pipe(uglify())
	.pipe(concat("streamer.js"))
	.pipe(gulp.dest("./dst/js"))
});

gulp.task("scripts-player", function() {
	gulp.src(["./src/js/vendor/{,*/}*.js", "./src/js/player/{,*/}*.js"])
	.pipe(plumber())
	.pipe(uglify())
	.pipe(concat("player.js"))
	.pipe(gulp.dest("./dst/js"))
});

gulp.task("scripts-admin", function() {
	gulp.src(["./src/js/vendor/{,*/}*.js", "./src/js/admin/{,*/}*.js"])
	.pipe(plumber())
	.pipe(uglify())
	.pipe(concat("admin.js"))
	.pipe(gulp.dest("./dst/js"))
});

gulp.task("images", function() {
	gulp.src("./src/images/{,*/}*")
	.pipe(plumber())
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