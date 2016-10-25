var router = require('express').Router()
var Product = require('../models/product')

Product.createMapping(function(err, mapping) {
	if (err) {
		console.log('Error Creating Mapping')
		console.log(err)
	} else {
		console.log('Mapping Created')
		console.log(mapping)
	}
})

var stream = Product.synchronize()
var count = 0

stream.on('data', function(err, doc) {
	count++
})

stream.on('close', function() {
	console.log('Indexed ' + count + ' documents!')
})

stream.on('error', function(err) {
	console.log(err)
})

router.post('/search', function(req, res, next) {
	res.redirect('/search?q=' + req.body.q)
})

router.get('/search', function(req, res, next) {
	if (req.query.q) {
		Product.search({
			query_string: {
				query: req.query.q
			}
		}, function(err, results) {
			if (err) return next(err)
			var data = results.hits.hits.map(function(hit) {
				return hit
			})
			res.render('main/search-result', {
				query: req.query.q,
				data: data
			})
		})
	}
})

router.get('/', function(req, res, next) {
	res.render('main/home')
})

router.get('/about', function(req, res, next) {
	res.render('main/about')
})

router.get('/products/:id', function(req, res, next) {
	Product.find({
		category: req.params.id
	}).populate('category').exec(function(err, products) {
		if (err) return next(err)
		res.render('main/category', {
			products: products
		})
	})
})

router.get('/product/:id', function(req, res, next) {
	Product.findById({
		_id: req.params.id
	}, function(err, product) {
		if (err) return next(err)
		res.render('main/product', {
			product: product
		})
	})
})

module.exports = router
