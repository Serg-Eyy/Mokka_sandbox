const lab  = exports.lab = require('lab').script(),
      Code = require('code'),
      Bcrypt = require("bcrypt");

process.env.NODE_ENV = 'test';                                                                      // switching to a test mode
process.env.PORT = 3000;

const api = require('../../apiServer/server'),                                                      // setting up the environment
      describe = lab.describe,
      it = lab.it,
      before = lab.before,
      beforeEach = lab.beforeEach,
      expect = Code.expect;

describe ('Testing API endpoints for Auth controller with an empty DB', () => {
  let response;

  before(async () => {
    await api.init();                                                                               // we need to initiate the server while inject doesn't wait modules to load
    api.mongo.db.collection('users').remove({});                                                    // clearing related collections
  });

  it('01. Checks if API is running. ' +
    'Should return "Mokka API" string with code 200.', async () => {
    response = await api.inject({method: 'GET', url: '/'});

    expect(response.result).to.be.a.string();
    expect(response.result).to.be.equal('Mokka API');
    expect(response.statusCode).to.be.equal(200);
  });

  it('02. Checks if custom 404 message is working. ' +
    'Should return error with custom message and code 404.', async () => {
    response = await api.inject({method: 'GET', url: '/abc'});

    expect(response.statusCode).to.be.equal(404);
    expect(response.result.error).to.be.equal('Not Found');
    expect(response.result.message).to.be.equal('This resource isn’t available.');
  });

  it('03. Checks if it is possible to signin without credentials. ' +
    'Should return error with custom message and code 400.', async () => {
    response = await api.inject({method: 'POST', url: '/api/auth/signin'});

    expect(response.result.error).to.be.equal('Bad Request');
    expect(response.result.message).to.be.equal('Invalid request payload input');
    expect(response.statusCode).to.be.equal(400);
  });

  it('04. Checks if it is possible to signin with the empty DB. ' +
    'Should return User-not-found message.', async () => {
    response = await api.inject({
      method: 'POST',
      payload: {login: 'admin', pwd: 'admin'},
      url: '/api/auth/signin'
    });

    expect(response.statusMessage).to.be.equal('Unauthorized');
    expect(response.result.err).to.be.equal('User not found. Authentication failed!');
    expect(response.statusCode).to.be.equal(401);
  });
});



describe ('Testing API endpoints for Auth controller with filled DB', () => {
  let response;

  before(async () => {
    let result = await api.mongo.db.collection('users').save({                                                   // adding a test user
      login:'admin',
      pwd:await Bcrypt.hashSync('admin',10),
      scope:'admin'
    });
    if (result.result.ok!==1) console.log(result.result);
  });

  it('05. Tests if it is possible to login with a wrong login. ' +
     'Should return User-not-found message.', async () => {
    response = await api.inject({
      method: 'POST',
      payload:{login:'adin', pwd:'admin'},
      url: '/api/auth/signin'
    });

    expect(response.statusMessage).to.be.equal('Unauthorized');
    expect(response.result.err).to.be.equal('User not found. Authentication failed!');
    expect(response.statusCode).to.be.equal(401);
  });

  it('06. Tests if it is possible to login with the empty password. ' +
     'Should return error with custom message and code 401.', async () => {
    response = await api.inject({
      method: 'POST',
      payload:{login:'admin', pwd:''},
      url: '/api/auth/signin'
    });

    expect(response.statusMessage).to.be.equal('Bad Request');
    expect(response.result.message).to.be.equal('Invalid request payload input');
    expect(response.statusCode).to.be.equal(400);
  });

  it('07. Tests if it is possible to login with a wrong password. ' +
     'Should return error with custom message and code 401.', async () => {
    response = await api.inject({
      method: 'POST',
      payload:{login:'admin', pwd:'admn'},
      url: '/api/auth/signin'
    });

    expect(response.statusMessage).to.be.equal('Unauthorized');
    expect(response.result.err).to.be.equal('Wrong password!');
    expect(response.statusCode).to.be.equal(401);
  });

  it('08. Tests if it is possible to login with valid credentials. ' +
     'Should return error with custom message and code 401.', async () => {
    response = await api.inject({
      method: 'POST',
      payload:{login:'admin', pwd:'admin'},
      url: '/api/auth/signin'
    });

    expect(response.statusMessage).to.be.equal('Created');
    expect(response.statusCode).to.be.equal(201);
  });

});
