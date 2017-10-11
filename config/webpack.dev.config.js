// refer to https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      'webpack/hot/only-dev-server',
      process.cwd() + '/app/index',
    ],
  },
  output: {
    path: '/',
    filename: '[name].bundle.js',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    'env',
                    {
                      targets: {
                        chrome: 58,
                      },
                      useBuiltIns: true,
                      modules: false,
                      // refer to: https://github.com/gaearon/react-hot-loader/issues/313
                      include: ['transform-es2015-classes'],
                    },
                  ],
                  'stage-1',
                  'react',
                ],
                plugins: [
                  'react-hot-loader/babel',
                  'transform-decorators-legacy',
                ],
              },
            },
          },
          {
            test: /\.less$/,
            oneOf: [
              {
                include: /node_modules/,
                use: [
                  {
                    loader: 'style-loader',
                  },
                  {
                    loader: 'css-loader',
                  },
                  {
                    loader: 'less-loader',
                    options: {
                      noIeCompat: true,
                      // paths: [
                      //   path.resolve(__dirname, 'node_modules'),
                      // ],
                    },
                  },
                ]
              },
              {
                use: [
                  {
                    loader: 'style-loader',
                  },
                  {
                    loader: 'css-loader',
                    options: {
                      modules: true,
                      localIdentName: '[name]__[local]--[hash:base64:5]',
                    },
                  },
                  {
                    loader: 'less-loader',
                    options: {
                      noIeCompat: true,
                    },
                  },
                ]
              },
            ],
          },
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            use: {
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[ext]',
              }
            },
          },
        ],
      }
    ],
  },
  devtool: 'cheap-module-source-map',
  target: 'electron-renderer',
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '..'),
      manifest: require('../assets/manifest.json'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
