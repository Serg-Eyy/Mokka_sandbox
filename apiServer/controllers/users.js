/** User model and methods for handling related requests (called from routes) **/

const Bcrypt      = require('bcrypt'),
      ObjectId    = require('mongodb').ObjectId,
      createToken = require('./auth').createToken;

class User {
  constructor (user) {
    this.login = user.login;                       // type : String, required : true, unique : true,  minlength : 3
    this.pwd = user.pwd;                           // type : String, required : true, minlength : 6
    this.email = user.email;                       // type : String, required : true, unique : true
    this.role = user.role || 'User';               // type : String, required : true, enum : ['Admin', 'User', 'ReadOnly'], default : 'User'
    // noinspection JSUnusedGlobalSymbols
    this.created_at = Date.now();                  // type : Date, default : Date.now
    this.twitter = user.twitter || '';             // String, {oAuth token}
    this.google = user.google || '';               // String, {oAuth token}
    this.github = user.github || '';               // String, {oAuth token}
    this.facebook = user.facebook || '';           // String, {oAuth token}
    // noinspection JSUnusedGlobalSymbols
    this.profile = {
      name: user.profile.name || '',               // String
      gender: user.profile.gender || '-',          // String, enum : ['m', 'f', '-'], default : '-'
      location: user.profile.location || '',       // String
      website: user.profile.website || '',         // String
      picture: user.profile.picture || ''          // String
    }
  }
}

// noinspection JSUnusedLocalSymbols
module.exports = {
  verifyUniqueUser : async (req, h) => {
    const usr = req.payload;
    if (!usr || !usr.login || !usr.pwd || !usr.email) return {err: 'Incomplete user data!'};

    // noinspection JSUnresolvedVariable
    const coll = req.mongo.db.collection('users');

    const user = await coll.findOne({ $or: [ {email: usr.email}, {login: usr.login} ] });           // we can search for all matches, but it makes no sense, since we will significantly increase complexity of checks but won't gain a lot

    if (user && (!usr._id || usr._id !== user._id))                                                 // if a user was found or we are updating (_id is not null) a user and found user doesn't match
      if (user.login === usr.login) return {err: 'The login is already in use.'};
      else return {err: 'The email is already in use.'};
  },

  validateUser: async (req, h) => {
    if (req.auth.isAuthenticated) return h.redirect(req.query.next || '/');
    if (!req.payload.login || !req.payload.pwd) throw Boom.badRequest('Missing login or password');

    // noinspection JSUnresolvedVariable
    const coll = req.mongo.db.collection('users');
    const usrs = await coll.find({login: req.payload.login}).toArray();

    if (usrs.length > 1) return {err: 'DB error (multiple identical logins)!', auth : false};
    if (usrs.length < 1) return {err: 'User not found. Authentication failed!', auth : false};

    const isValid = Bcrypt.compareSync(req.payload.pwd, usrs[0].pwd);
    if (!isValid) return {err: 'Wrong password!', auth : false};

    return {token : await createToken(usrs[0]), auth: true};
  },

  getMyProfile : async (req, h) => {
    let profile = {};
    try{
      console.log(req);                                                 // TODO add check that use is getting his own profile (compare id from token)
      // noinspection JSUnresolvedVariable
      const usr = await req.mongo.db.collection('users').findOne({_id:ObjectId(req.auth.credentials.id)});
      if (!usr) return Boom.notFound('User not found!');
      profile.login = usr.login;
      profile.email = usr.email;
    } catch(err)  { throw Boom.notFound( `Cannot find the user in DB (${err.message})!`) }
    return profile;
  },
  saveMyProfile : async (req, h) => {
    console.log(req);                                                 // TODO add check that use is saving his own profile (compare id from token)
    const usr = req.payload;
    usr.pwd = Bcrypt.hashSync(usr.pwd,10);
    // noinspection JSUnresolvedVariable
    req.mongo.db.collection('users').save(usr)
    .then(() => 'ok')
    .catch(err => `Error saving the item into DB (${err.message}).` );
  },
  getAll : async (req, h) => {
    // noinspection JSUnresolvedVariable
    let usrs = await req.mongo.db.collection('users').find();
    if(!usrs.length) return {err: 'No users found!'};
    for(let usr of usrs) {
      delete(usr['pwd']);                                                                           // removing passwords and versions
      delete(usr['__v']);
    }
    return usrs;
  },

  getUser : async (req, h) => {
    // noinspection JSUnresolvedVariable, JSUnresolvedFunction
    req.mongo.db.collection('users').findById(req.params.id)
      .then(usr =>{
        if (Array.isArray(usr)) return {err: 'DB error (multiple identical logins)!'};
        if (!usr) return {err : 'User not found!'};
        return usr;
      })
      .catch(err => `Cannot find the user in DB (${err.message})!`);
  },

  saveUser : async (req, h) => {
    const usr = req.payload;
    usr.pwd = Bcrypt.hashSync(usr.pwd,10);
    // noinspection JSUnresolvedVariable
    req.mongo.db.collection('users').save(usr)
      .then(() => 'ok')
      .catch(err => `Error adding the item into DB (${err.message}).` );
  },
  deleteUser: async (req, h) => {
    // noinspection JSUnresolvedVariable
    req.mongo.db.collection('users').remove({_id : req.params.id})
      .then(() => 'ok')
      .catch(err => `Error deleting the item from DB (${err.message}).` );
  }
};