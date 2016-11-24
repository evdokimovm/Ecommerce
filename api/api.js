var router = require('express').Router()
var secret = require('../config/secret')
var Product = require('../models/product')
var User = require('../models/user')

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

router.post('/set-admin', function(req, res, next) {
	if (req.body.invite == secret.invite) {
		User.update({
			_id: req.user._id
		}, {
			$set: {
				isAdmin: true
			}
		}, function(err, updated) {
			if(updated) {
				req.flash('success', 'You Now Admin')
				res.redirect('/edit-profile')
			}
		})
	} else {
		req.flash('error', 'Token not Correct')
		res.redirect('/edit-profile')
	}
})

router.post('/change-password', function(req, res, next) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (req.body.new_password && req.body.old_password) {
			if (user.comparePassword(req.body.old_password)) {
				user.password = req.body.new_password

				user.save(function(err) {
					if (err) return next(err)
					req.flash('success', 'Successfully Edited Your Password')
					return res.redirect('/edit-profile')
				})
			} else {
				req.flash('error', 'Old Password Not Correct')
				return res.redirect('/edit-profile')
			}
		} else {
			req.flash('error', 'You Need to Fill Old Password and New Password Fields to Change Password')
			return res.redirect('/edit-profile')
		}
	})
})

module.exports = router
