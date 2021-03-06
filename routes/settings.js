var User = require('../models/user')
var Token = require('../models/token')
var secret = require('../config/secret')
var sendMailHelper = require('../helpers/send')
var router = require('express').Router()

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

router.post('/edit-profile', function(req, res, next) {
	User.findOne({ _id: req.user._id }, function(err, user) {
		if (err) return next(err)

		if (req.body.name) user.profile.name = req.body.name
		if (req.body.address) user.address = req.body.address

		user.save(function(err) {
			if (err) return next(err)
			req.flash('success', 'Successfully Edited Your Profile')
			return res.redirect('/edit-profile')
		})
	})
})

router.post('/resend-verify-link', function(req, res, next) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (err) return next(err)

		sendMailHelper(user.email, user.verify_token)

		req.flash('success', 'Link Sending')
		res.redirect('/profile')
	})
})

router.post('/delete-account', function(req, res, next) {
	User.remove({
		_id: req.user._id
	}, function(err) {
		Token.remove({
			user: req.user._id
		}, function(err) {
			req.flash('success', 'Account Deleted')
			res.redirect('/signup')
		})
	})
})

module.exports = router
