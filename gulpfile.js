const {src, dest, watch, parallel, series} = require('gulp');
const scss                                 = require('gulp-sass')(require('sass'));
const concat                               = require('gulp-concat')
const uglify                               = require('gulp-uglify-es').default;
const browserSync                          = require('browser-sync').create();
const autoprefixer                         = require('gulp-autoprefixer');
const gulpSourcemaps                       = require('gulp-sourcemaps');
const clean                                = require('gulp-clean');
const avif                                 = require('gulp-avif');
const imagemin                             = require('gulp-imagemin');
const webp                                 = require('gulp-webp');
const newer                                = require('gulp-newer');
const fonter                               = require('gulp-fonter');
const ttfWoff                              = require('gulp-ttf2woff2');
const svgSprite                            = require('gulp-svg-sprite');
const include = require('gulp-include');


// function pages (){
//     return src('app/scss/*.scss')
//     .pipe(include({
//         includePaths: 'app/scss'
//     }))
//     .pipe(dest('app/style.min.css'))
//     .pipe(browserSync.stream())
// }

function fonts()
{
    return src('app/fonts/src/*.*')
    .pipe(fonter ({
        formats: ['woff', 'ttf']
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttfWoff())
    .pipe(dest('app/fonts'))
}


function images()
{
    return src(['app/img/src/*.*', '!app/img/src/*.svg'])
    .pipe(newer('app/img'))
    .pipe(avif({quality: 50}))

    .pipe(src('app/img/src/*.*'))
    .pipe(newer('app/img'))
    .pipe(webp())

    .pipe(src('app/img/src/*.*'))
    .pipe(newer('app/img'))
    .pipe(imagemin())

    .pipe(dest('app/img'))
}

function sprite()
{
    return src('app/img/*.svg')
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../sprite.svg',
                example: true
            }
        }
    }))
    .pipe(dest('app/img'))
}

function script()
{
    return src([
        'node_modules/swiper/swiper-bundle.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles()
{
    return src('app/scss/*.scss')
    .pipe(gulpSourcemaps.init())
    .pipe(autoprefixer({overrideBrowsersList: ['last 10 version']}))
    .pipe(concat('style.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))

    .pipe(gulpSourcemaps.write('.' ))
    .pipe(dest('app/css'))

    .pipe(browserSync.stream())
}

function watching()
{
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/*.scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/main.js'], script)
    // watch(['app/components/*, app/pages/*'])
    watch(['app/*.html']).on('change', browserSync.reload)
}


function building()
{
    return src([
        'app/css/style.min.css',
        'app/img/dist/*.*',
        '!app/img/dist/*.svg',
        'app/img/dist/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        // 'app/**/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function cleanDist()
{
    return src('dist')
    .pipe(clean())
}

exports.styles   = styles;
exports.images   = images;
exports.fonts    = fonts;
exports.cleanDist = cleanDist;
exports.building = building;
exports.sprite   = sprite;
// exports.pages = pages;
exports.script   = script;
exports.watching = watching;


exports.build   = series(cleanDist, building);
exports.default = parallel(styles, images, script, watching);