/**
 * Server Service
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const PROJECT_ROOT = process.cwd();
const ConfigerFolder = process.argv[2].split('=')[1];
const ConfigerName = process.argv[3].split('=')[1];
const _port = + process.argv[4].split('=')[1];

const PORT = _port ? Number(_port) : 3000;

const ConfigPath = path.join(ConfigerFolder, `node_modules/${ConfigerName}`);
const projectConfig = require(`${PROJECT_ROOT}/abc.json`);

const { getDevConfig } = require(`${ConfigPath}/index`);
const DefaultProjectConfig = require(`${ConfigPath}/src/projectConfig`);

const mergedProjectConfig = Object.assign({}, DefaultProjectConfig, projectConfig);

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

getDevConfig(mergedProjectConfig, {
  port: PORT,
}).then(webpackConfig => {
  const compiler = Webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, getDevServerConfig(mergedProjectConfig));
  server.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`server started at ${PORT}`);
  });
}).catch((e) => {
  throw Error(e);
});
