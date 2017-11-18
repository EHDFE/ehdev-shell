/**
 * Server Service
 * @author ryan.bian
 */
const path = require('path');
const {
  Webpack,
  WebpackDevServer,
  PORT,
  projectConfig,
  getDevConfig,
  getProvidePlugin,
  dllConfigParser,
  PROJECT_ROOT,
  noticeLog,
  getLocalIP,
} = require('./config');

const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;
const AddAssetHtmlPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'add-asset-html-webpack-plugin'));
const chalk = require(path.join(SHELL_NODE_MODULES_PATH, 'chalk'));

const getDevServerConfig = PROJECT_CONFIG => ({
  contentBase: path.join(process.cwd(), PROJECT_CONFIG.buildPath),
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
  https: !!PROJECT_CONFIG.https,
  host: '0.0.0.0',
  overlay: true,
  historyApiFallback: PROJECT_CONFIG.historyApiFallback || false,
  proxy: Object.assign({}, PROJECT_CONFIG.proxy),
  stats: {
    colors: true,
    errorDetails: true,
  },
  // open the browser automaticly
  open: true,
  useLocalIp: true,
});

getDevConfig(projectConfig, {
  port: PORT,
}).then(async webpackConfig => {
  // add provide plugin if has the config
  if (projectConfig.providePluginConfig) {
    Object.assign(webpackConfig, {
      plugins: webpackConfig.plugins.concat(
        getProvidePlugin(projectConfig)
      ),
    });
  }
  const dllConfigs = dllConfigParser(projectConfig);
  if (dllConfigs) {
    webpackConfig.plugins.unshift(dllConfigs.getPlugin());
    webpackConfig.plugins.push(
      new AddAssetHtmlPlugin({
        filepath: path.resolve(PROJECT_ROOT, 'src/dll/*.js'),
      })
    );
  }
  const compiler = Webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, getDevServerConfig(projectConfig));
  server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    const url = chalk.underline(`http://${ip}:${PORT}`);
    noticeLog('SERVER', `start at ${url}`);
  });
}).catch((e) => {
  throw Error(e);
});
