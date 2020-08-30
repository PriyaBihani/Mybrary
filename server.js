// all the request come here and send to mvc model. request may came from the buttons we make on the client side  

if (process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}

const express = require('express') // requring express
const app = express()               // requiring express function which has pretty much everything we want to use
const expressLayouts = require('express-ejs-layouts') // 
const bodyParser = require('body-parser')
const methodOverride = require('method-override')//it is required to use the put and delete request
const indexRouter= require('./routes/index')// letting the server know that these 
const authorRouter = require('./routes/authors')//routes are there
const bookRouter = require('./routes/books')//routes are there


app.set('view engine', 'ejs')
app.set('views',__dirname+'/views')// here we hooked render to views
app.set('layout','layouts/layout')// thats why it is rendering this page. Above 3 set are used when we render something from the routes.

app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))// now when we link stylesheet in layout.ejs file the public folder will be appended in stylesheet
app.use(bodyParser.urlencoded({ limit :'10mb',extended: false }))// bcoz we are acuiring data from forms

const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/mybrary", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
// mongoose.connect(process.env.DATABASE_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connect to mongoose'))

//starting point
app.use('/',indexRouter)// thats why it is only rendering index.ejs file but not other.ejs file
app.use('/authors',authorRouter)// here it calls the authors file with routes everytime their is a change in the link
app.use('/books', bookRouter)

app.listen(process.env.PORT|| 3000)