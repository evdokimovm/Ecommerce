var router = require('express').Router()

router.get('/', function(req, res, next) {
	res.render('main/home')
})

router.get('/about', function(req, res, next) {
	res.render('main/about')
})

module.exports = router
