/** child_service utils
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const del = require('del');
const selfsigned = require('selfsigned');
const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;
const chalk = require(path.join(SHELL_NODE_MODULES_PATH, 'chalk'));
const defaultsDeep = require('lodash/defaultsDeep');

// const ExtractTextPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'extract-text-webpack-plugin'));
const CleanWebpackPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'clean-webpack-plugin'));
const UglifyJsPlugin = exports.UglifyJsPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'uglifyjs-webpack-plugin'));

const defaultUglifyOptions = {
  cache: false,
  parallel: true,
  sourceMap: true,
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

const projectConfig = require(`${PROJECT_ROOT}/abc.json`);
const { DEFAULT_PROJECT_CONFIG, getDevConfig, getProdConfig } = require(ConfigPath);

exports.ConfigerFolderPath = ConfigerFolder;

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
    mode: 'production',
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
      // new ExtractTextPlugin({
      //   filename: '[name].[contenthash:8].css',
      // }),
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

const getHttpsConfig = sslPath => {
  // Use a self-signed certificate if no certificate was configured.
  // Cycle certs every 24 hours

  const certPath = path.join(sslPath, 'server.pem');
  let certExists = fs.existsSync(certPath);

  if (certExists) {
    const certStat = fs.statSync(certPath);
    const certTtl = 1000 * 60 * 60 * 24;
    const now = new Date();

    // cert is more than 30 days old, kill it with fire
    if ((now - certStat.ctime) / certTtl > 30) {
      // eslint-disable-next-line no-console
      console.info('SSL Certificate is more than 30 days old. Removing.');
      del.sync([certPath], { force: true });
      certExists = false;
    }
  }

  if (!certExists) {
    // eslint-disable-next-line no-console
    console.info('Generating SSL Certificate');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days: 30,
      keySize: 2048,
      extensions: [{
        name: 'basicConstraints',
        cA: true
      }, {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      }, {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost'
          },
          {
            type: 2,
            value: 'localhost.localdomain'
          },
          {
            type: 2,
            value: 'lvh.me'
          },
          {
            type: 2,
            value: '*.lvh.me'
          },
          {
            type: 2,
            value: '[::1]'
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1'
          },
          {
            type: 7,
            ip: 'fe80::1'
          }
        ]
      }]
    });

    fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
  }
  const fakeCert = fs.readFileSync(certPath);

  return {
    key: fakeCert,
    cert: fakeCert,
  };
};

exports.getHttpsConfig = getHttpsConfig;
