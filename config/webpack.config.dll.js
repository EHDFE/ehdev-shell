const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = () => {
  const IS_DEV = process.env.NODE_ENV === 'development';

  const plugins = [
    new webpack.DllPlugin({
      context: path.join(__dirname, '../app'),
      path: path.join(
        __dirname,
        !IS_DEV ? '../app/dll/manifest.prod.json' : '../app/dll/manifest.dev.json'
      ),
      name: '[name]',
    }),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      if ( !/[/\\]moment[/\\]/.test(context.context) ) return;
      Object.assign(context, {
        regExp: /^\.\/\w+/,
        request: '../../locale' // resolved relatively
      });
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ];
  if (!IS_DEV) {
    plugins.push(
      new UglifyJSPlugin({
        parallel: true,
        uglifyOptions: {
          ecma: 6,
        },
      })
    );
  }
  return {
    context: path.resolve(__dirname, '../app'),
    entry: {
      dll: [
        'react',
        'react-copy-to-clipboard',
        'react-dom',
        'react-redux',
        'redux',
        'redux-actions',
        'redux-promise',
        'moment',
        'antd',
        'classnames',
        'react-router',
        'react-router-dom',
        'remarkable',
        'reselect',
        'prop-types',
        'xterm',
      ],
    },
    output: {
      path: path.join(__dirname, '../app/dll/'),
      filename: !IS_DEV ? '[name].prod.js' : '[name].dev.js',
      library: '[name]',
    },
    plugins,
    devtool: 'source-map',
  };
};
