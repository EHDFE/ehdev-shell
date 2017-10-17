// refer to https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {

  const plugins = [];
  let extractLibiaryStyle;
  let extractAppStyle;
  const libirayStyleConfig = [
    {
      loader: 'css-loader',
      options: {
        minimize: env.prod,
      },
    },
    {
      loader: 'less-loader',
      options: {
        noIeCompat: true,
      },
    },
  ];
  const appStyleConfig = [
    {
      loader: 'css-loader',
      options: {
        modules: true,
        minimize: env.prod,
        localIdentName: env.prod ? '[hash:base64:5]' : '[name]__[local]--[hash:base64:3]',
      },
    },
    {
      loader: 'less-loader',
      options: {
        noIeCompat: true,
      },
    },
  ];

  if (env.prod) {
    extractLibiaryStyle = new ExtractTextPlugin('lib.css');
    extractAppStyle = new ExtractTextPlugin('app.css');
    plugins.push(
      new webpack.DllReferencePlugin({
        context: path.resolve(__dirname, '..'),
        manifest: require('../assets/dll/manifest.prod.json'),
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      new UglifyJSPlugin({
        parallel: true,
        uglifyOptions: {
          ecma: 6,
        },
      }),
      extractLibiaryStyle,
      extractAppStyle
    );
  } else {
    libirayStyleConfig.unshift({
      loader: 'style-loader',
    });
    appStyleConfig.unshift({
      loader: 'style-loader',
    });
    plugins.push(
      new webpack.DllReferencePlugin({
        context: path.resolve(__dirname, '..'),
        manifest: require('../assets/dll/manifest.dev.json'),
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    );
  }

  plugins.push(
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      if ( !/\/moment\//.test(context.context) ) return;
      Object.assign(context, {
        regExp: /^\.\/\w+/,
        request: '../../locale' // resolved relatively
      });
    }),
  );

  return {
    entry: {
      app: env.prod ?
        [
          'babel-polyfill',
          process.cwd() + '/app/index',
        ] : [
          'babel-polyfill',
          'react-hot-loader/patch',
          'webpack-hot-middleware/client',
          'webpack/hot/only-dev-server',
          process.cwd() + '/app/index',
        ],
    },
    output: {
      path: path.resolve(__dirname, '../assets'),
      filename: env.prod ? '[name].min.js' : '[name].js',
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
                          chrome: 59,
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
                  plugins: env.prod ? [
                    'transform-decorators-legacy',
                  ] : [
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
                  use: env.prod ? extractLibiaryStyle.extract({
                    use: libirayStyleConfig
                  }) : libirayStyleConfig,
                },
                {
                  use: env.prod ? extractAppStyle.extract({
                    use: appStyleConfig
                  }) : appStyleConfig,
                },
              ],
            },
            {
              exclude: [/\.js$/, /\.html$/, /\.json$/],
              use: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name].[ext]',
                }
              },
            },
          ],
        }
      ],
    },
    devtool: env.prod ? 'source-map' : 'cheap-module-source-map',
    target: 'electron-renderer',
    plugins,
  };
};
