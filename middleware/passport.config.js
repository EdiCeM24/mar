const LocalStrategy = require("passport-local").Strategy;
const bcryptSalt = require('bcryptjs');


function initialize(passport, getUserByEmail, getUserById) {
  const AuthenticatedUser = async (email, password, done) => {
    const user = getUserByEmail(email); // Implement this function to get user by email from DB
    if(user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if(await bcryptSalt.compare(password, user.password)) {
        return done(null, user);
      }else{
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (error) {
      return done(error);
    }
  }

  passport.use(
    new LocalStrategy({ usernameField: "email" }, AuthenticatedUser));

  passport.serializeUser((user, done) => done(null, user.id) );
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  } );
  
}

module.exports = initialize;