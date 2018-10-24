/**
 * Server Service
 * @author ryan.bian
 */
const path = require('path');
const {
  Webpack,
  WebpackDevServer,
  projectConfig,
  getDevConfig,
  getProvidePlugin,
  dllConfigParser,
  PROJECT_ROOT,
  noticeLog,
  getLocalIP,
  getHttpsConfig,
  ENV_CONFIG,
} = require('./config');

const AddAssetHtmlPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'add-asset-html-webpack-plugin',
));
const DuplicatePackageCheckerPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'duplicate-package-checker-webpack-plugin',
));
const ErrorOverlayPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'error-overlay-webpack-plugin',
));
const chalk = require(path.join(ENV_CONFIG.SHELL_NODE_MODULES_PATH, 'chalk'));

if (ENV_CONFIG.https) {
  if (typeof ENV_CONFIG.https === 'boolean') {
    Object.assign(ENV_CONFIG, {
      https: getHttpsConfig(ENV_CONFIG.CONFIGER_FOLDER_PATH),
    });
  }
}

const getDevServerConfig = PROJECT_CONFIG => {
  const cwd = process.cwd();

  let contentBase = PROJECT_CONFIG.contentBase;
  let contentBaseConfig;
  if (contentBase) {
    if (!Array.isArray(contentBase)) {
      contentBase = [contentBase];
    }
    contentBaseConfig = contentBase.map(relPath => path.resolve(cwd, relPath));
  } else {
    contentBaseConfig = path.join(cwd, PROJECT_CONFIG.buildPath);
  }
  return {
    contentBase: contentBaseConfig,
    hot: true,
    disableHostCheck: true,
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: '/',
    // Enable HTTPS if the project config's variable is set to 'true'
    https: ENV_CONFIG.https,
    host: '0.0.0.0',
    overlay: true,
    historyApiFallback: PROJECT_CONFIG.historyApiFallback || false,
    proxy: Object.assign({}, PROJECT_CONFIG.proxy),
    stats: 'minimal',
    // stats: 'normal',
    noInfo: ENV_CONFIG.noInfo,
    // open the browser automaticly
    open: true,
    useLocalIp: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};

const ip = getLocalIP();
getDevConfig(projectConfig, {
  port: ENV_CONFIG.port,
  ip,
  https: ENV_CONFIG.https,
})
  .then(async webpackConfig => {
    Object.assign(webpackConfig, {
      mode: 'development',
    });
    // add provide plugin if has the config
    if (projectConfig.providePluginConfig) {
      Object.assign(webpackConfig, {
        plugins: webpackConfig.plugins.concat(getProvidePlugin(projectConfig)),
      });
    }
    const dllConfigs = dllConfigParser(projectConfig);
    if (dllConfigs) {
      webpackConfig.plugins.unshift(dllConfigs.getPlugin());
      webpackConfig.plugins.push(
        new AddAssetHtmlPlugin({
          filepath: path.resolve(PROJECT_ROOT, 'src/dll/*.js'),
        }),
      );
    }
    webpackConfig.plugins.push(
      new ErrorOverlayPlugin(),
      new DuplicatePackageCheckerPlugin({
        showHelp: true,
      }),
      new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      }),
    );
    const compiler = Webpack(webpackConfig);
    const server = new WebpackDevServer(
      compiler,
      getDevServerConfig(projectConfig),
    );
    server.listen(ENV_CONFIG.port, '0.0.0.0', () => {
      const url = chalk.underline(
        `${ENV_CONFIG.https ? 'https' : 'http'}://${ip}:${ENV_CONFIG.port}`,
      );
      noticeLog('SERVER', `start at ${url}`);
    });
  })
  .catch(e => {
    throw Error(e);
  });
