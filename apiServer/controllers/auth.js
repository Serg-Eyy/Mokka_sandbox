/** Methods for authentication (called from routes) **/

const jwt      = require('jsonwebtoken'),
      ObjectId = require('mongodb').ObjectId,
      Boom     = require('boom'),
      secret   = require('../../config/config').jwtKey;

// noinspection JSUnusedLocalSymbols
module.exports = {
  createToken: async user => {
    return jwt.sign({
      id: user._id,
      login: user.login,
      scope: user.role
    }, secret, {algorithm: 'HS256', expiresIn: "1h" });
  },

  validateToken: async (decoded, req) => {
    if (decoded && decoded.id && decoded.login) {
      let result;
      try {
        // noinspection JSUnresolvedVariable
        result = await req.mongo.db.collection('users').findOne({_id: ObjectId(decoded.id)});
      } catch (err) {console.log(err)}

      if (result.login === decoded.login) return {isValid: true};
    }
    return {isValid: false};
  },

  signin : async (req, h) => {
    // noinspection JSUnresolvedVariable
    if (req.pre.authResult.auth) { // noinspection JSUnresolvedVariable
      return h.response({ token : req.pre.authResult.token}).code(201);
    }
    // noinspection JSUnresolvedVariable
    return h.response({err : req.pre.authResult.err}).code(401);
  },

  login0Auth: async (req, h) => {                                                                   // TODO implement for tokens
    if (!req.auth.isAuthenticated)
      throw Boom.unauthorized('Authentication failed: ' + req.auth.error.message);

    // noinspection JSUnusedLocalSymbols
    const profile = req.auth.credentials.profile;
/*    req.cookieAuth.set({
      uid : null,
      auth0Id: profile.id,
      uname: profile.username,
      displayName: profile.displayName
    });
*/
    return h.redirect('/');
  },
  root : (req, h) => { return h.response('Mokka API')},
  notFound : async (req, h) =>{
    throw Boom.notFound('This resource isn’t available.');                                          // TODO implement internationalisation
 }
};