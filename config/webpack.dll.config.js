const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    dll: [
      'react',
      'react-dom',
      'antd'
    ],
  },
  output: {
    path: path.join(__dirname, '../assets/'),
    filename: '[name].js',
    library: '[name]',
  },
  plugins: [
    new webpack.DllPlugin({
      context: path.join(__dirname, '..'),
      path: path.join(__dirname, '../assets/manifest.json'),
      name: '[name]',
    }),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
};
