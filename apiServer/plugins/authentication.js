// noinspection JSUnusedLocalSymbols
/** Plugin for initialisation of authentication procedures **/

async function register (server, options) {
  const authProviders = [
/* Make sure to set a "Callback URL" and check the "Allow this application to be used to Sign in with Twitter"
   on the "Settings" tab in your Twitter application
*/
    {provider: 'twitter', clientId: 'your-client-id', clientSecret: 'your-client-secret' },         // TODO change credentials
// https://futurestud.io/tutorials/hapi-authenticate-with-github-and-remember-the-login
    {provider: 'github',  clientId: 'your-client-id', clientSecret: 'your-client-secret' },
/* You'll need to go to https://developers.facebook.com/ and set up a Website application to get started
   Once you create your app, fill out Settings and set the App Domains Under Settings >> Advanced,
   set the Valid OAuth redirect URIs to include http://<yourdomain.com>/rout1 ... /routN and enable Client OAuth Login
*/
    {provider: 'facebook',clientId: 'your-client-id', clientSecret: 'your-client-secret' },
/* You'll need to go to https://console.developers.google.com and set up an application to get started
   Once you create your app, fill out "APIs & auth >> Consent screen" and make sure to set the email field
   Next, go to "APIs & auth >> Credentials and Create new Client ID
   Select "web application" and set "AUTHORIZED JAVASCRIPT ORIGINS" and "AUTHORIZED REDIRECT URIS"
   This will net you the clientId and the clientSecret needed.
   Also be sure to pass the location as well. It must be in the list of "AUTHORIZED REDIRECT URIS"
   You must also enable the Google+ API in your profile.
   Go to APIs & Auth, then APIs and under Social APIs click Google+ API and enable it.
*/
    {provider: 'google',  clientId: 'your-client-id', clientSecret: 'your-client-secret' },
// https://futurestud.io/tutorials/hapi-authenticate-with-gitlab-and-remember-the-user
    {provider: 'gitlab',  clientId: 'your-client-id', clientSecret: 'your-client-secret' },
    {provider: 'slack',   clientId: 'your-client-id', clientSecret: 'your-client-secret' }
  ];
  const jwtSecret = require('../../config/config').jwtKey;                                          // secret jwt key TODO Change the key for production

  await server.register([
    {plugin: require('hapi-auth-jwt2')},
    {plugin: require('bell')}                                                                       // declare and install dependency to bell (oAuth driver)
  ]);

  server.auth.strategy('token', 'jwt', {
    key : jwtSecret,
    verifyOption : { algorithms : [ 'HS256' ] },
    validate : require('../controllers/auth').validateToken
  });
  server.log('info', 'Plugin registered: token authentication with strategy »jwt« .');

  for (const ap of authProviders) {
    ap.password = jwtSecret;
    ap.isSecure = process.env.NODE_ENV === 'production';                                            // Should be true (which is the default) in production
    server.auth.strategy(ap.provider, 'bell', ap);
    server.log('info', `Plugin registered: bell authentication with strategy »${ap.provider}« .`);
  }

  server.auth.default('token');
}

exports.plugin = {
  register,
  name: 'authentication',
  version: '1.0.0',
  once: true
};