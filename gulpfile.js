var gulp = require('gulp'),
	settings = require('./package.json').settings,

	tinypng = require('gulp-tinypng-compress'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	spritesmith = require('gulp.spritesmith'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css');


gulp.task('tinypng', function () {
	gulp.src([settings.tinypng.tinyIgnore,
		settings.tinypng.tinyInput])
		.pipe(tinypng({
			key: 'QQGG6B3O8cI-sp9fJ89mapMAkGRX4hA-',
			sameDest: true,
			sigFile: 'build/img/.tinypng-sigs',
			log: true
		}))
		.pipe(gulp.dest(settings.tinypng.tinyOutput));
});

gulp.task('autoprefixer', function () {
	gulp.src(settings.autoprefixer.prefixInput)
});

gulp.task('sass', function () {
	return gulp.src(settings.sass.sassInput)
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(gulp.dest(settings.sass.sassOutput))
		.pipe(autoprefixer({
			browsers: ['last 20 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(settings.sass.sassOutput))
});

gulp.task('watch', function () {
	gulp.watch(settings.watch.watchInput, ['sass']);
});

gulp.task('sprite', function () {
	var spriteData =
		gulp.src(settings.spritesmith.input)
			.pipe(spritesmith({
				imgName: '../img/sprite.png',
				cssName: '_sprites.scss',
				cssFormat: 'scss',
				padding: 2
			}));
	spriteData.img.pipe(gulp.dest(settings.spritesmith.outputImage));
	spriteData.css.pipe(gulp.dest(settings.spritesmith.outputSass));
});

gulp.task('iconfont', function () {
	var runTimestamp = Math.round(Date.now() / 1000);

	return gulp.src([settings.iconfont.input + '*.svg'])
		.pipe(iconfontCss({
			fontName: settings.iconfont.fontName,
			path: settings.iconfont.template + '_iconfont.scss',
			targetPath: settings.iconfont.outputScss + '_icons.scss',
			fontPath: '../fonts/',
			firstGlyph: 0xf120 // Codes for glyphs should be in area where are no icons by default on iOS and Android
		})).pipe(iconfont({
			fontName: settings.iconfont.fontName,
			formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
			normalize: true,
			prependUnicode: true,
			fontHeight: 1001,
			timestamp: runTimestamp
		})).pipe(gulp.dest(settings.iconfont.outputFont));

});

