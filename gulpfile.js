var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var envify = require('envify/custom');
var partialify = require('partialify');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var rimraf = require('gulp-rimraf');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var reactify = require('reactify');



// default task /////////////////////////////////////////////////
gulp.task('default', ['build'], function() {

    gulp.src('public/lib/**/*')
        .pipe(gulp.dest('build/lib'));

    browserSync({
        tunnel: true,
        open: false,
        files: ['./build/**/*', '!./build/lib/**/*'],
        ghostMode: false,
        reloadDelay: 200,
        notify: false,
        https: true,
        server: {
            baseDir: './build',
        },
    });

    gulp.watch('public/**/*.js', ['browserify']);
    gulp.watch('public/**/*.html', ['assets']);
    gulp.watch('public/**/*.css', ['css']);
    gulp.watch('public/**/*.less', ['less']);
    gulp.watch('public/img/**/*', ['images']);
});

gulp.task('clean', function() {
    return gulp.src(['build/**/*'], {
        read: false
    }).pipe(rimraf());
});



// build tasks //////////////////////////////////////////////////
gulp.task('build', ['css', 'assets', 'images', 'browserify']);

gulp.task('browserify', function() {
    var environ = {
        NODE_ENV: process.env.NODE_ENV
    };
    return browserify('./public/main.js')
        .require('react')
        .transform(envify(environ))
        .transform(partialify)
        .transform(reactify)

    .bundle({
        debug: process.env.NODE_ENV != 'production'
    })
        .on('error', function(err) {
            notify.onError('Error: <%= error.message %>')(err);
            this.end();
        })
        .pipe(source('index.js'))
        .pipe(gulp.dest('build/'));
});



// assets //////////////////////////////////////////////////////
gulp.task('assets', function() {
    gulp.src(['./public/**/*.html', '!./public/lib/**/*'])
        .pipe(gulp.dest('build/'));
});


gulp.task('css', function() {
    return gulp.src(['public/**/*.css', '!./public/lib/**/*'])
        .pipe(autoprefixer('last 1 version'))
        .pipe(gulp.dest('./build'))
});

gulp.task('less', function() {
    var less_transform = less();
    less_transform.on('error', function(err) {
        notify.onError('<%= error.message %>')(err);
        this.end();
    });
    return gulp.src('./public/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less_transform)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build'));
});

gulp.task('images', ['favicon'], function() {
    return gulp.src('public/img/**/*')
        .pipe(gulp.dest('build/img'));
});

gulp.task('favicon', function() {
    return gulp.src('public/img/favicon.ico')
        .pipe(gulp.dest('build/'));
});