const router = require('express').Router() ;
const controller = require('../controllers/project') ;
const isLoggedin = require('../middlewares/auth') ;

router.use(isLoggedin) ;


router.route('/create').post(controller.postCreateProject).get(controller.getCreateProject) ;
router.route('/:id').post(controller.postProject).get(controller.getProject);
router.post('/:id/databases',controller.postDatabase) ;
router.post('/:id/config',controller.postConfig) ;


module.exports = router ;
