const Hapi = require('hapi'),
      cfg  = require('../config/config');

const apiServer = new Hapi.Server({                                                                 // TODO add logging
  host: cfg.apiHost || 'localhost',
  port: process.env.PORT || cfg.apiPort || 3000,
  routes: { cors: true }                                                                            // while we separate app and api, we need to allow CORS
});

apiServer.app.uuid = 0;

apiServer.init = async() => {
  try {
    const suffix =  process.env.NODE_ENV==='test'?'_test':'';                                       // suffix for choosing test DB during tests

    await apiServer.register([
      { plugin: require('hapi-mongodb'),
        options: {
          url: cfg.dbUrl+suffix,
          decorate: true
        }
      },
      { plugin: require('./plugins/authentication') }
    ]);

    await apiServer.route(require('./routes'));

    await apiServer.start();
    console.log(`Server is up and running at: ${apiServer.info.uri} and bounded to: ${apiServer.info.address}.`);
  } catch (err) {
    console.log (`Error starting web server. Details: ${err.message}.`);
    process.exit(1);
  }
};

module.exports = apiServer;