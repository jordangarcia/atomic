// webpack.config.js
var path = require('path')

module.exports = {
  entry: {
    //framework: './src/framework/index.js',
    example: './src/example/app.js',
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
  },
  resolve: {
    root: [
      path.join(__dirname,  './src'),
      path.join(__dirname,  './src/framework'),
      path.join(__dirname, './node_modules'),
    ],
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/, // include .js files
        exclude: /node_modules/, // exclude any and all files in the node_modules folder
        loader: "jshint-loader"
      }
    ],

    loaders: [
      { test: /\.html/, loader: 'html-loader' },
      { test: /\.js$/, loader: 'jstransform-loader' },
      //{ test: /\.js$/, loader: 'traceur-loader?runtime' },
      { test: /\.css$/, loaders: ["style", "css"] },
      { test: /\.scss$/, loader: "style!css!sass?outputStyle=expanded" },
    ]
  },
  jshint: {
    asi: true,
    esnext: true,
  }
};
