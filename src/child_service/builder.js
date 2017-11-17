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
} = require('./config');

const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;
const AddAssetHtmlPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'add-asset-html-webpack-plugin'));
const StatsPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'stats-webpack-plugin'));

getProdConfig(projectConfig)
  .then(webpackConfig => {
    try {
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
      webpackConfig.plugins.push(
        new StatsPlugin(
          '../stats.json',
          'verbose'
        ),
      );
      Object.assign(webpackConfig, {
        profile: true,
      });
      const compiler = Webpack(webpackConfig);

      compiler.run((err, stats) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          return;
        }
        if (stats.hasErrors()) {
          // eslint-disable-next-line no-console
          console.log(stats.toJson().errors[0].split('\n').slice(0, 2).join('\n'));
          return;
        }
        // eslint-disable-next-line no-console
        console.log('\n' + stats.toString({
          hash: false,
          chunks: false,
          children: false,
          colors: true,
        }));
      });

    } catch (e) {
      throw Error(e);
    }
  });

