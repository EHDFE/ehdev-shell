/**
 * Webpack config for production electron main process
 */

const path = require('path');
const webpack = require('webpack');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  target: 'electron-main',

  context: path.resolve(__dirname, '../'),

  entry: {
    index: './src/index',
    apiService: './src/apiService',
  },

  // 'main.js' in root
  output: {
    path: path.resolve(__dirname, '../app/main-build'),
    filename: './[name].js',
    libraryTarget: 'commonjs2',
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.DEBUG_PROD': JSON.stringify(process.env.DEBUG_PROD || 'false')
    }),
  ],

  externals: {
    'node-notifier': 'node-notifier',
    'node-pty': 'node-pty',
    'pngquant-bin': 'pngquant-bin',
    'mozjpeg': 'mozjpeg',
    'gifsicle': 'gifsicle',
    'cwebp-bin': 'cwebp-bin',
    'guetzli': 'guetzli',
    'zopflipng-bin': 'zopflipng-bin',
    'tempfile': 'tempfile',
    // eslint: {
    //   commonjs2: 'eslint',
    // }
  },

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'none',
};
