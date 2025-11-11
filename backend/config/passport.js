import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { pool } from '../db.js';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre, email FROM usuarios WHERE id = ? LIMIT 1',
        [payload.id]
      );
      if (!rows.length) return done(null, false); 
      return done(null, rows[0]);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
