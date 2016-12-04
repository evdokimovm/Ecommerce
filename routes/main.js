var router = require('express').Router()
var Product = require('../models/product')
var Category = require('../models/category')
var Cart = require('../models/cart')
var User = require('../models/user')
var async = require('async')
var stripe = require('stripe')('SECRET_KEY')

function paginate(req, res, next) {
	var perPage = 9
	var page = req.params.page

	Product
		.find({})
		.skip(perPage * page)
		.limit(perPage)
		.populate('category')
		.exec(function(err, products) {
			Product.count().exec(function(err, count) {
				if (err) return next(err)
				res.render('main/product-main', {
					products: products,
					pages: count / perPage
				})
			})
		})
}

router.get('/cart', function(req, res, next) {
	if (!req.user) {
		res.redirect('/login')
	} else if (req.user && !req.user.verified) {
		req.flash('error', 'To Access to Cart Page and Payment You Need to Verify Account')
		res.redirect('/edit-profile')
	} else {
		Cart
			.findOne({
				owner: req.user._id
			})
			.populate('items.item')
			.exec(function(err, foundCart) {
				if(err) return next(err)
				res.render('main/cart', {
					foundCart: foundCart,
					message: req.flash('remove')
				})
			})
	}
})

router.post('/product/:product_id', function(req, res, next) {
	Cart.findOne({
		owner: req.user._id
	}, function(err, cart) {
		cart.items.push({
			item: req.body.product_id,
			price: parseFloat(req.body.priceValue),
			quantity: parseInt(req.body.quantity)
		})

		cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2)

		cart.save(function(err) {
			if (err) return next(err)
			return res.redirect('/cart')
		})
	})
})

router.post('/remove', function(req, res, next) {
	Cart.findOne({
		owner: req.user._id
	}, function(err, foundCart) {
		foundCart.items.pull(String(req.body.item))

		foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2)

		foundCart.save(function(err, found) {
			if (err) return next(err)
			req.flash('remove', 'Successfully removed')
			res.redirect('/cart')
		})
	})
})

router.post('/search', function(req, res, next) {
	res.redirect('/search?q=' + req.body.q)
})

router.get('/search', function(req, res, next) {
	if (req.query.q) {
		Product
			.find({
				name: {
					$regex: req.query.q,
					$options: 'i'
				}
			})
			.populate('category')
			.lean()
			.exec(function(err, products) {
				if (err) return next(err)
				res.render('main/search-result', {
					query: req.query.q,
					data: products
				})
			})
	}
})

router.get('/', function(req, res, next) {
	if (req.user) {
		paginate(req, res, next)
	} else {
		res.render('main/home')
	}
})

router.get('/page/:page', function(req, res, next) {
	paginate(req, res, next)
})

router.get('/about', function(req, res, next) {
	res.render('main/about')
})

router.get('/products/:id', function(req, res, next) {
	Category.findOne({
		_id: req.params.id
	}, function(err, foundCategory) {
		if (foundCategory) {
			Product.find({
				category: req.params.id
			}).populate('category').exec(function(err, products) {
				if (err) return next(err)
				res.render('main/category', {
					products: products
				})
			})
		} else {
			req.flash('error', 'Category Not Found')
			res.redirect('/add-category')
		}
	})
})

router.get('/product/:id', function(req, res, next) {
	Product.findOne({
		_id: req.params.id
	}, function(err, foundProduct) {
		if (foundProduct) {
			res.render('main/product', {
				product: foundProduct
			})
		} else {
			req.flash('error', 'Product Not Found')
			res.redirect('/add-product')
		}
	})
})

router.post('/payment', function(req, res, next) {
	var stripeToken = req.body.stripeToken
	var currentCharges = Math.round(req.body.stripeMoney * 100)

	stripe.customers.create({
		source: stripeToken
	}).then(function(customer) {
		return stripe.charges.create({
			amount: currentCharges,
			currency: 'usd',
			customer: customer.id
		})
	}).then(function(charge) {
		async.waterfall([
			function(callback) {
				Cart.findOne({
					owner: req.user._id
				}, function(err, cart) {
					callback(err, cart)
				})
			},
			function(cart, callback) {
				User.findOne({
					_id: req.user._id
				}, function(err, user) {
					if(user) {
						for(var i = 0; i < cart.items.length; i++) {
							user.history.push({
								item: cart.items[i].item,
								paid: cart.items[i].price
							})
						}
						user.save(function(err, user) {
							if (err) return next(err)
							callback(err, user)
						})
					}
				})
			},
			function(user) {
				Cart.update({
					owner: user._id
				}, {
					$set: {
						items: [],
						total: 0
					}
				}, function(err, updated) {
					if(updated) {
						res.redirect('/profile')
					}
				})
			}
		])
	})
})

module.exports = router
