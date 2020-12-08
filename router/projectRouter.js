const router = require('express').Router() ;
const controller = require('../controllers/project') ;
const isLoggedin = require('../middlewares/auth') ;

router.use(isLoggedin) ;

router.route('/create').get(controller.getCreateProject).post(controller.postCreateProject) ;

router.route('/:id').get(controller.getProject).post(controller.postProject);router.post('/:id/databases',controller.postDatabase) ;
router.post('/:id/config',controller.postConfig) ;


module.exports = router ;
