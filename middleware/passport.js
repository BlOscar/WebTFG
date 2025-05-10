const passport = require('passport');
const {User} = require('./../Models/User');

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
    const opts = {
        jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(),(req)=>req.cookies.token]),
        secretOrKey:  'secret'
    };

const verify = passport.use(new JwtStrategy(opts,async function(jwt_payload, done) {
    try{
    const user = await User.findOne({where: {id: jwt_payload.id}});
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }catch(err){
        console.log(err);
        return done(err,false);
    }
}));

module.exports = verify;
    
    