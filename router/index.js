const router = require('express').Router();
const userRouter = require('./userRouter');
const projectRouter = require('./projectRouter');




router.get('/', (req, res) => {
    res.render("home")
})


router.get('/test', (req, res) => {
    res.render("test")
})

router.get('/test2', (req, res) => {
    res.render("projectdetails")
})

router.use('/accounts', userRouter);
router.use('/project', projectRouter);





module.exports = router
