// refer to https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ErrorOverlayWebpackPlugin = require('error-overlay-webpack-plugin');

const port = process.env.PORT || 1212;

module.exports = env => {

  const plugins = [];
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
        javascriptEnabled: true
      }
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
        javascriptEnabled: true
      }
    }
  ];

  if (env.prod) {
    // extractLibiaryStyle = new ExtractTextPlugin('lib.css');
    // extractAppStyle = new ExtractTextPlugin('app.css');
    plugins.push(
      // new webpack.DllReferencePlugin({
      //   context: path.resolve(__dirname, '../app'),
      //   manifest: require('../app/dll/manifest.prod.json'),
      // }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      // new UglifyJSPlugin({
      //   parallel: true,
      //   uglifyOptions: {
      //     ecma: 6,
      //   },
      //   sourceMap: true,
      // }),
      // extractLibiaryStyle,
      // extractAppStyle
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new OptimizeCssAssetsPlugin({
        canPrint: true
      })
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
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
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
    new HtmlWebpackPlugin({
      template: './app/index.html',
    }),
  );

  if (env.dev) {
    plugins.push(
      // new AddAssetHtmlWebpackPlugin([{
      //   filepath: require.resolve('../app/dll/dll.dev.js'),
      // }])
      new ErrorOverlayWebpackPlugin(),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: 'dll/dll.dev.js',
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
    context: path.resolve(__dirname, '..'),
    entry: {
      app: env.prod ?
        [
          // '@babel/polyfill',
          './app/index',
        ] : [
          // '@babel/polyfill',
          // 'react-hot-loader/patch',
          // `/webpack-dev-server/client?http://localhost:${port}`,
          // 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true',
          // '/webpack/hot/only-dev-server',
          './app/index',
        ],
    },
    output: {
      path: path.resolve(__dirname, '../app/dist'),
      filename: env.prod ? '[name].min.js' : '[name].js',
      publicPath: env.prod ? '../dist/' : '/',
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
                  plugins: env.prod ? [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-syntax-export-default-from',
                    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
                  ] : [
                    'react-hot-loader/babel',
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
                  use: env.prod ? [
                    MiniCssExtractPlugin.loader,
                  ].concat(libirayStyleConfig) : libirayStyleConfig,
                },
                {
                  resourceQuery: /no-css-module/,
                  use: env.prod ? [
                    MiniCssExtractPlugin.loader,
                  ].concat(libirayStyleConfig) : libirayStyleConfig,
                },
                {
                  use: env.prod ? [
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
    devtool: env.prod ? 'source-map' : 'cheap-module-source-map',
    target: 'electron-renderer',
    plugins,
    node: {
      __dirname: false,
      __filename: false
    },
  };

  if (!env.prod) {
    Object.assign(ret, {
      devServer: {
        port,
        publicPath: '/',
        compress: true,
        noInfo: false,
        inline: true,
        lazy: false,
        // hot: true,
        hotOnly: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentBase: path.join(__dirname, '../app'),
        watchOptions: {
          aggregateTimeout: 300,
          ignored: /node_modules/,
          poll: 100
        },
        historyApiFallback: {
          verbose: true,
          disableDotRule: false,
        },
      },
    });
  }

  return ret;
};
