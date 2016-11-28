var Product = require('../models/product')
var router = require('express').Router()

router.post('/search', function(req, res, next) {
	Product
		.find({
			name: {
				$regex: req.body.search_term,
				$options: 'i'
			}
		})
		.populate('category')
		.lean()
		.exec(function(err, results) {
			if (err) return next(err)
			res.json(results)
		})
})

module.exports = router
