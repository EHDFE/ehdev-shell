// refer to https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');
const devConfig = require('./webpack.dev.config');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = Object.assign({}, devConfig, {
  entry: {
    app: [
      'babel-polyfill',
      process.cwd() + '/app/index',
    ],
  },
  devtool: 'none',
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '..'),
      manifest: require('../assets/manifest.json'),
    }),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      if ( !/\/moment\//.test(context.context) ) return;
      Object.assign(context, {
        regExp: /^\.\/\w+/,
        request: '../../locale' // resolved relatively
      });
    }),
    new UglifyJSPlugin({
      parallel: true,
      uglifyOptions: {
        ecma: 6,
      },
    }),
  ],
});
