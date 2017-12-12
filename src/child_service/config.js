/** child_service utils
 * @author ryan.bian
 */
const path = require('path');
const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;
const chalk = require(path.join(SHELL_NODE_MODULES_PATH, 'chalk'));
const defaultsDeep = require('lodash/defaultsDeep');

const ExtractTextPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'extract-text-webpack-plugin'));
const CleanWebpackPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'clean-webpack-plugin'));
const UglifyJsPlugin = exports.UglifyJsPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'uglifyjs-webpack-plugin'));

const defaultUglifyOptions = {
  cache: false,
  parallel: true,
  sourceMap: false,
  uglifyOptions: {
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
  },
};

const getUglifyJsOptions = exports.getUglifyJsOptions = projectConfig => {
  const options = defaultsDeep(defaultUglifyOptions, {
    uglifyOptions: {
      ie8: !!projectConfig.supportIE8,
    },
  }, projectConfig.uglifyConfig || {});
  return options;
};

// webpack path
const Webpack = exports.Webpack = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack'));
exports.WebpackDevServer = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack-dev-server'));

// project paths
const PROJECT_ROOT = exports.PROJECT_ROOT = process.cwd();

// configer info
const ConfigerFolder = process.env.CONFIGER_FOLDER_PATH;
const ConfigerName = process.env.CONFIGER_NAME;
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
  const manifestPath = path.resolve(PROJECT_ROOT, 'src/manifest.json');
  const dllConfig = {
    entry: {
      dll: include,
    },
    context: PROJECT_ROOT,
    output: {
      path: path.join(PROJECT_ROOT, 'src/dll'),
      filename: '[name].[hash:8].js',
      library: '[name]',
    },
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin([
        'src/dll'
      ], {
        root: PROJECT_ROOT,
        verbose: true,
        dry: false,
      }),
      new Webpack.DllPlugin({
        context: PROJECT_ROOT,
        path: manifestPath,
        name: '[name]',
      }),
      new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
      }),
      new Webpack.HashedModuleIdsPlugin(),
      new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new UglifyJsPlugin(getUglifyJsOptions(projectConfig)),
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

const NOTICE_COLOR_MAP = new Map([
  ['log', 'green'],
  ['error', 'red'],
  ['success', 'green'],
  ['warn', 'yellow'],
]);

exports.noticeLog = (action, content, type = 'log') => {
  const color = NOTICE_COLOR_MAP.get(type);
  const message = chalk[color](content);
  const time = `[${new Date().toLocaleString()}]`;
  // eslint-disable-next-line no-console
  console.log(
    `\n${chalk.gray(time)} ${action}: ${message}`
  );
};

exports.getLocalIP = () => {
  const ifs = require('os').networkInterfaces();
  return Object.keys(ifs)
    .map(x => ifs[x].filter(x => x.family === 'IPv4' && !x.internal)[0])
    .filter(x => x)[0].address;
};
