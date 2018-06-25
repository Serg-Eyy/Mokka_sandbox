/** Routes related to user handling **/

const UserHandlers   = require('../controllers/users'),
      UserValidation = require('../validations/users');

module.exports = [
  { method  : 'GET',
    path    : '/api/me',
    options : {
      auth : { strategy : 'token'},//, scope : ['admin', 'user'] },
      handler : UserHandlers.getMyProfile
    }
  },
  { method  : 'PUT',
    path    : '/api/me',
    options : {
      auth    : { strategy : 'token'},//, scope : ['admin', 'user'] },
      pre     : [{ method : UserHandlers.verifyUniqueUser }],
      handler : UserHandlers.saveMyProfile
    }
  },
  { method  : 'GET',
    path    : '/api/users',
    options : {
      auth : { strategy : 'token', scope : ['admin'] },
      handler : UserHandlers.getAll
    }
  },
  { method  : 'GET',
    path    : '/api/user/{id}',
    options : {
      auth : { strategy : 'token', scope : ['admin'] },
      handler : UserHandlers.getUser
    }
  },
  { method : ['POST', 'PUT' ],
    path   : '/api/users',
    options: {
      auth : { strategy : 'token', scope : ['admin'] },
      pre      : [{ method : UserHandlers.verifyUniqueUser }],
      handler  : UserHandlers.saveUser,
//      validate : UserValidation.create
    }
  },
  { method : 'DELETE',
    path   : '/api/user/{id}',
    options: {
      auth : { strategy : 'token', scope : ['admin'] },
      handler  : UserHandlers.deleteUser,
    }
  }
];



/*
const auth = require('../controllers/auth'),
      createUserSchema = require('../schemas/createUser'),
      user = require('../controllers/users');

exports.initRouting = server => {

  server.route({
    method : 'POST',
    path   :'/api/user',
    options : {
      pre :[{method: user.verifyUniqueUser}],
      handler: (req, h)  => user.create(req),
      validate: {payload:createUserSchema},
      failAction:(req, h, err) => {
        const email = request.payload.email;        // e.g. remember the user’s email address and pre-fill for comfort reasons
        return h
          .view('signup', {
            email,
            error: 'The email address is already registered'
          })
          .code(400)
          .takeover()                               // <-- this is the important line
      }
    }
  });

  server.route({
    method : 'GET',
    path   :'/api/users',
    options : {
      handler: (req, h)  => user.findAll(req)
    }
  });


  server.route({
    method:'GET',
    path:'/',
    handler:(request, h) => {
      return 'Hello, world!';
    }
  });

  server.route({
    method:'GET',
    path:'/{name}',
    handler:(request, h) => {
      return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
  });
 */