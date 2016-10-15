var express = require('express')
var morgan = require('morgan')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var ejs = require('ejs')
var engine = require('ejs-mate')

var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('express-flash')

var secret = require('./config/secret')
var User = require('./models/user')

var app = express()

mongoose.connect(secret.database)

app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: secret.secretKey
}))
app.use(flash())
app.engine('ejs', engine)
app.set('view engine', 'ejs')

var mainRoutes = require('./routes/main')
app.use(mainRoutes)

var userRoutes = require('./routes/user')
app.use(userRoutes)

app.listen(secret.port, function() {
	console.log('Node.js listening on port ' + secret.port)
})
