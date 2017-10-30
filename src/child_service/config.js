/** child_service utils
 * @author ryan.bian
 */
const path = require('path');
const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;

const ExtractTextPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'extract-text-webpack-plugin'));

// webpack path
const Webpack = exports.Webpack = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack'));
exports.WebpackDevServer = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack-dev-server'));

// project paths
const PROJECT_ROOT = exports.PROJECT_ROOT = process.cwd();

// configer info
const ConfigerFolder = process.argv[2].split('=')[1];
const ConfigerName = process.argv[3].split('=')[1];
const ConfigPath = path.join(ConfigerFolder, `node_modules/${ConfigerName}`);

let port;
if (process.argv[4]) {
  port = + process.argv[4].split('=')[1];
}
// dev server port
exports.PORT = port ? port : 3000;

const projectConfig = require(`${PROJECT_ROOT}/abc.json`);
const { DEFAULT_PROJECT_CONFIG, getDevConfig, getProdConfig } = require(ConfigPath);

// project config
exports.projectConfig = Object.assign({}, DEFAULT_PROJECT_CONFIG, projectConfig);
exports.getDevConfig = getDevConfig;
exports.getProdConfig = getProdConfig;

// exports providePlugin
exports.getProvidePlugin = projectConfig => {
  if (!projectConfig.providePluginConfig) return false;
  return new Webpack.ProvidePlugin(projectConfig.providePluginConfig);
};

// exports dll config
exports.dllConfigParser = projectConfig => {
  if (!projectConfig.dll || !projectConfig.dll.enable) return false;
  const {
    include,
  } = projectConfig.dll;
  const manifestPath = path.join(PROJECT_ROOT, 'src/manifest.json');
  const dllConfig = {
    entry: {
      dll: include,
    },
    output: {
      path: path.join(PROJECT_ROOT, 'src/dll'),
      filename: '[name].[hash:8].js',
      library: '[name]',
    },
    devtool: 'source-map' ,
    plugins: [
      new Webpack.DllPlugin({
        context: PROJECT_ROOT,
        path: manifestPath,
        name: '[name]',
      }),
      new Webpack.HashedModuleIdsPlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
          ascii_only: true,
        },
        sourceMap: true,
      }),
      new ExtractTextPlugin({
        filename: '[name].[contenthash:8].css',
      }),
    ],
  };
  return {
    config: dllConfig,
    getPlugin: () => new Webpack.DllReferencePlugin({
      context: PROJECT_ROOT,
      manifest: require(manifestPath),
    }),
  };
};
