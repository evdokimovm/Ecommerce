module.exports = {
	database: 'mongodb://localhost:27017/ecommerce',
	port: 8080,
	secretKey: '7ba989c93121392970cdefd15853e046',
	facebook: {
		clientID: 'FACEBOOK_APP_ID',
		clientSecret: 'FACEBOOK_APP_SECRET',
		profileFields: ['emails', 'displayName'],
		callbackURL: 'http://localhost:8080/auth/facebook/callback'
	}
}
