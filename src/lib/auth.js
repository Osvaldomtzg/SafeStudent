module.exports = {

    isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }else{
            return res.redirect('/login/padre');
        }
    },

    isNotLoggedIn(req, res, next){
        if(!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/student');
    }

}