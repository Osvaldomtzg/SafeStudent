const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'matricula',
    passportField: 'password',
    passReqToCallback: true
},  async(req, matricula, password, done) =>{
    const rows = await pool.query('SELECT * FROM alumnos WHERE id_alumno = ? AND id_padre = ?', [matricula, password]);
    if (rows.length > 0) {
        const user = rows[0];
        const rowsPadre = await pool.query('SELECT * FROM padres_tutores WHERE curp = ?', [user.id_padre]);
        const padre = rowsPadre[0];
        done(null, user, req.flash('success','Bienvenido' + padre.nombre));
    }else{
        done(null, false, req.flash('message','Usuario o contraseña incorrecta'));
    }
}));

passport.serializeUser((user, done) =>{
    done(null, user.id_alumno);
});

passport.deserializeUser(async (id, done) =>{
    const rows = await pool.query('SELECT * FROM alumnos WHERE id_alumno = ?', [id]);
    done(null, rows[0]);
});