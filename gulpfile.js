var gulp = require('gulp')
var shell = require('gulp-shell')
var path = require('path')
var connect = require('gulp-connect');

var example = {
  assets: [
    'src/example/**/*.css',
    'src/example/index.html',
    'src/example/**/*.woff'
  ],
  dist: path.join(__dirname, './build'),
}

gulp.task('example:copy', function() {
  gulp.src(example.assets)
  .pipe(gulp.dest(example.dist));
});

gulp.task('example:watch:assets', function() {
  gulp.watch(example.assets, ['example:copy'])
})

gulp.task('example:connect', function() {
  connect.server({
    root: example.dist,
    port: 1337
  });
})

gulp.task('webpack:watch', shell.task([
  'webpack --progress --colors -w'
]));

gulp.task('example', [
  'example:copy',
  'example:connect',
  'example:watch:assets',
  'webpack:watch',
])

gulp.task('default', function() {
  gulp.start('example')
});
