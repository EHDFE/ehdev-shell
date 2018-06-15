// refer to https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ErrorOverlayWebpackPlugin = require('error-overlay-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const moment = require('moment');
const history = require('connect-history-api-fallback');
const convert = require('koa-connect');

const port = process.env.PORT || 1212;

module.exports = () => {

  const IS_DEV = process.env.NODE_ENV === 'development';

  const plugins = [];
  const [
    libirayStyleConfig,
    appStyleConfig,
  ] = [
    {
      loader: 'css-loader',
      options: {
        minimize: !IS_DEV,
      },
    },
    {
      loader: 'css-loader',
      options: {
        modules: true,
        minimize: !IS_DEV,
        localIdentName: !IS_DEV ? '[hash:base64:5]' : '[name]__[local]--[hash:base64:3]',
      },
    },
  ].map(config => [config].concat({
    loader: 'less-loader',
    options: {
      noIeCompat: true,
      javascriptEnabled: true
    }
  }));

  if (!IS_DEV) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.BUILD_TIME': JSON.stringify(moment().format()),
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
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
        context: path.resolve(__dirname, '../app'),
        manifest: require('../app/dll/manifest.dev.json'),
      }),
      // new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.BUILD_TIME': JSON.stringify(moment().format()),
      }),
      // warns you when multiple versions of the same package exist in a build.
      new DuplicatePackageCheckerPlugin({
        showHelp: true,
      }),
    );
  }

  plugins.push(
    // Add module names to factory functions so they appear in browser profiler.
    // new webpack.NamedModulesPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      if ( !/\/moment\//.test(context.context) ) return;
      Object.assign(context, {
        regExp: /^\.\/\w+/,
        request: '../../locale' // resolved relatively
      });
    }),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new MonacoWebpackPlugin({
      languages: ['json'],
      features: ['bracketMatching', 'caretOperations', 'clipboard', 'codelens', 'comment', 'contextmenu', 'coreCommands', 'cursorUndo', 'dnd', 'find', 'folding', 'format', 'gotoDeclarationCommands', 'gotoDeclarationMouse', 'gotoError', 'gotoLine', 'hover', 'inPlaceReplace', 'inspectTokens', 'iPadShowKeyboard', 'linesOperations', 'links', 'multicursor', 'parameterHints', 'quickCommand', 'quickOutline', 'referenceSearch', 'rename', 'smartSelect', 'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode', 'transpose', 'wordHighlighter', 'wordOperations'],
    }),
    new HtmlWebpackPlugin({
      template: './app/index.html',
    }),
  );

  if (IS_DEV) {
    plugins.push(
      new ErrorOverlayWebpackPlugin(),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: 'dll.dev.js',
        append: false,
        publicPath: '/',
      })
    );
  } else {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
        openAnalyzer: process.env.OPEN_ANALYZER === 'true'
      }),
    );
  }

  const ret = {
    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
    context: path.resolve(__dirname, '..'),
    entry: {
      app: [
        // '@babel/polyfill',
        './app/index',
      ],
    },
    output: {
      path: path.resolve(__dirname, '../app/dist'),
      filename: '[name].js',
      publicPath: IS_DEV ? '/' : '../dist/',
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
                      '@babel/preset-env',
                      {
                        targets: {
                          chrome: 61,
                        },
                        useBuiltIns: 'usage',
                        modules: false,
                        babelrc: false,
                        shippedProposals: true,
                        // refer to: https://github.com/gaearon/react-hot-loader/issues/313
                        // include: ['transform-es2015-classes'],
                      },
                    ],
                    '@babel/preset-react',
                  ],
                  plugins: IS_DEV ? [
                    'react-hot-loader/babel',
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-syntax-export-default-from',
                    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
                  ] : [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-syntax-export-default-from',
                    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
                  ],
                },
              },
            },
            {
              test: /\.(c|le)ss$/,
              oneOf: [
                {
                  include: /node_modules/,
                  use: !IS_DEV ? [
                    MiniCssExtractPlugin.loader,
                  ].concat(libirayStyleConfig) : libirayStyleConfig,
                },
                {
                  resourceQuery: /no-css-module/,
                  use: !IS_DEV ? [
                    MiniCssExtractPlugin.loader,
                  ].concat(libirayStyleConfig) : libirayStyleConfig,
                },
                {
                  use: !IS_DEV ? [
                    MiniCssExtractPlugin.loader,
                  ].concat(appStyleConfig) : appStyleConfig,
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
    resolve: {
      extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.less'],
    },
    devtool: IS_DEV ? 'cheap-module-source-map' : 'source-map',
    target: 'electron-renderer',
    plugins,
    node: {
      __dirname: false,
      __filename: false,
    },
    optimization: {
      // minimize: false,
      minimizer: [
        new UglifyJSPlugin({
          parallel: true,
          uglifyOptions: {
            ecma: 6,
          },
        }),
      ],
    },
  };

  if (IS_DEV) {
    Object.assign(ret, {
      serve: {
        port,
        dev: {
          publicPath: '/',
          watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
          },
        },
        hot: {
          allEntries: true,
          autoConfigure: true,
          hot: true,
        },
        content: [
          path.join(__dirname, '../app/dll'),
        ],
        add(app, middleware, options) {
          const historyOptions = {};
          app.use(convert(history(historyOptions)));
        }
      },
    });
  }

  return ret;
};
