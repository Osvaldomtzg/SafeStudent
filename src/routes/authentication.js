const express = require('express');
const router = express.Router();

const pool = require('../database');
const passport = require('passport');

const  { isNotLoggedIn } = require('../lib/auth');

router.get('/login/padre', isNotLoggedIn, (req, res)=>{
    res.render('login/padre');
})

router.get('/login/instituto', isNotLoggedIn, (req, res)=>{
    res.render('login/instituto');
})

router.get('/login', isNotLoggedIn, (req, res)=>{
    res.redirect('login/padre');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/student',
        failureRedirect: '/login/padre',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login/padre');
      });
});

module.exports = router;