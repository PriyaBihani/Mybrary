const express = require('express')
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
  let books
  try {
    books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()// the query from mongoose dont give the promise, it gives something we called thenable which is basically some sort of like promise but dont have its full functionality. we to use exec() to gain the full functionality of the thenable as promise as mongoose query return thanable rather than actual promise. BUt we foresure can use await and then keywords in thenable
  } catch {
    books = []
  }
  res.render('index', { books: books })
})

module.exports = router