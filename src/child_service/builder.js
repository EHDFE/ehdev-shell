/**
 * Builder Service
 * @author ryan.bian
 */
const {
  Webpack,
  projectConfig,
  getProdConfig,
} = require('./config');

getProdConfig(projectConfig)
  .then(webpackConfig => {
    try {
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

