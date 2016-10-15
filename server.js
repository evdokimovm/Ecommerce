var express = require('express')
var morgan = require('morgan')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var ejs = require('ejs')
var engine = require('ejs-mate')

var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('express-flash')

var User = require('./models/user')

var app = express()

mongoose.connect('mongodb://localhost:27017/ecommerce')

app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: '7ba989c93121392970cdefd15853e046'
}))
app.use(flash())
app.engine('ejs', engine)
app.set('view engine', 'ejs')

var mainRoutes = require('./routes/main')
app.use(mainRoutes)

var userRoutes = require('./routes/user')
app.use(userRoutes)

var port = process.env.PORT || 8080
app.listen(port, function() {
	console.log('Node.js listening on port ' + port)
})
