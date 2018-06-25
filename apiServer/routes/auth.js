/** Routes related to authentication **/

const AuthHandlers   = require('../controllers/auth'),
      UserHandlers   = require('../controllers/users'),
      UserValidation = require('../validations/users');

module.exports = [
  { method    : 'GET',
    path      : '/',
    options   : {
      auth    : false,
      handler : AuthHandlers.root
    }
  },
  { method : 'POST',
    path   : '/api/auth/signin',
    options: {
      auth   : false,
      pre : [{ method: UserHandlers.validateUser, assign: 'authResult' }],
      handler: AuthHandlers.signin,
      validate : { payload: UserValidation.auth }
    }
  },
  { method    : 'GET',
    path      : '/api/auth/twitter',
    options   : {
      auth    : 'twitter',                                                                          //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method    : 'GET',
    path      : '/api/auth/github',
    options   : {
      auth    : 'github',                                                                           //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method    : 'GET',
    path      : '/api/auth/gitlab',
    options   : {
      auth    : 'gitlab',                                                                           //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method    : 'GET',
    path      : '/api/auth/google',
    options   : {
      auth    : 'google',                                                                           //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method    : 'GET',
    path      : '/api/auth/facebook',
    options   : {
      auth    : 'facebook',                                                                         //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method    : 'GET',
    path      : '/api/auth/slack',
    options   : {
      auth    : 'slack',                                                                            //<-- use twitter strategy and let bell take over
      handler : AuthHandlers.login0Auth
    }
  },
  { method: ['*'],
    path: '/{any*}',
    options: {
      auth: { mode: 'try' },
      handler: AuthHandlers.notFound
    }
  }
];
