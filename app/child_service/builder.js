/**
 * Builder Service
 * @author ryan.bian
 */
const path = require('path');
const {
  Webpack,
  projectConfig,
  getProdConfig,
  getProvidePlugin,
  dllConfigParser,
  PROJECT_ROOT,
  noticeLog,
  getLocalIP,
  ENV_CONFIG,
} = require('./config');

const AddAssetHtmlPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'add-asset-html-webpack-plugin',
));
const StatsPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'stats-webpack-plugin',
));
const BundleAnalyzerPlugin = require(path.join(
  ENV_CONFIG.SHELL_NODE_MODULES_PATH,
  'webpack-bundle-analyzer',
)).BundleAnalyzerPlugin;

getProdConfig(projectConfig).then(webpackConfig => {
  try {
    if (projectConfig.providePluginConfig) {
      Object.assign(webpackConfig, {
        plugins: webpackConfig.plugins.concat(getProvidePlugin(projectConfig)),
      });
    }
    const dllConfigs = dllConfigParser(projectConfig);
    if (dllConfigs) {
      webpackConfig.plugins.unshift(dllConfigs.getPlugin());
      if (!projectConfig.ignoreHtmlTemplate) {
        webpackConfig.plugins.push(
          new AddAssetHtmlPlugin({
            filepath: path.resolve(PROJECT_ROOT, 'src/dll/*.js'),
          }),
        );
      }
    }
    if (ENV_CONFIG.analyzer) {
      const ip = getLocalIP();
      webpackConfig.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          anaylzerHost: ip,
          anaylzerPort: '8888',
          openAnalyzer: true,
          logLevel: 'silent',
        }),
      );
    }
    webpackConfig.plugins.push(
      new StatsPlugin('../stats.json', 'verbose'),
      new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      }),
    );
    Object.assign(webpackConfig, {
      mode: 'production',
      profile: true,
    });
    const compiler = Webpack(webpackConfig);

    const ProgressPlugin = Webpack.ProgressPlugin;
    new ProgressPlugin({
      profile: true,
    }).apply(compiler);

    noticeLog('BUILD', 'START');

    compiler.run((err, stats) => {
      compiler.purgeInputFileSystem();

      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        noticeLog('BUILD', 'FAILED', 'error');
        return false;
      }
      if (stats.hasErrors()) {
        // eslint-disable-next-line no-console
        console.log(stats.toString('minimal'));
        noticeLog('BUILD', 'FAILED', 'error');
        return false;
      }
      // eslint-disable-next-line no-console
      console.log(
        '\n' +
          stats.toString({
            hash: false,
            chunks: false,
            children: false,
            cached: false,
            modules: false,
            colors: true,
          }),
      );

      noticeLog('BUILD', 'SUCCESS', 'success');
    });
  } catch (e) {
    throw Error(e);
  }
});
