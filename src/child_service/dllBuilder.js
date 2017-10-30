/**
 * Dll Builder Service
 * @author ryan.bian
 */
const {
  Webpack,
  projectConfig,
  getProdConfig,
  getProvidePlugin,
  dllConfigParser,
} = require('./config');

getProdConfig(projectConfig)
  .then(webpackConfig => {
    try {
      const dllConfigs = dllConfigParser(projectConfig);
      if (!dllConfigs) return;

      Object.assign(dllConfigs.config, {
        module: webpackConfig.module,
      });

      if (projectConfig.providePluginConfig) {
        Object.assign(dllConfigs.config, {
          plugins: dllConfigs.config.plugins.concat(
            getProvidePlugin(projectConfig)
          ),
        });
      }

      const compiler = Webpack(dllConfigs.config);

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

