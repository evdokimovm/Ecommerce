var nodemailer = require('nodemailer')

function sendMailHelper(toMail, token) {
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'example@gmail.com',
			pass: 'password'
		}
	})
	var mailOptions = {
		from: 'Ecommerce <example@gmail.com>',
		to: toMail,
		subject: 'Ecommerce Account Verification',
		text: 'http://localhost:8080/verify/' + token,
		html: '<a href="http://localhost:8080/verify/' + token + '" target="_blank">http://localhost:8080/verify/' + token + '</a>'
	}
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error)
		} else {
			console.log(info)
		}
	})
}

module.exports = sendMailHelper
