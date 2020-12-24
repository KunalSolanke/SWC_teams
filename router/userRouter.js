const controller = require('../controllers/user');
const router = require('express').Router();
const isLoggedin = require('../middlewares/auth');


//userAuth
router.route('/login').get(controller.getLogin).post(controller.postLogin);
router.route('/register').get(controller.getSignup).post(controller.postSignup);
router.post('/logout', controller.logout);
//userInfo
router.get('/projects', isLoggedin, controller.getMyProjects);
router.route('/profile').get(controller.getProfile).post(controller.postProfile);



module.exports = router




