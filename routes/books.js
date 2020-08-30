const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
//index page for all the books
router.get('/', async(req, res) => {
    let query = Book.find() // it will save all the books in query
    if(req.query.title != null &&  req.query.title != ''){ // we used query instead of body bcoz the data is send from the get request instead of post request.   
        query = query.regex('title', new RegExp(req.query.title,'i'))// regex is regular expression regex is constructor where as new RegExp is a constructor
    } 
    if(req.query.publishedBefore != null &&  req.query.publishedBefore != ''){
        query = query.lte('publishedDate', req.query.publishedBefore)// lte is less than or equal to 
    } 
    if(req.query.publishedAfter != null &&  req.query.publishedAfter != ''){
        query = query.gte('publishedDate', req.query.publishedAfter)// gte is greater than equal to 
    }
    try{
        const books = await query.exec()// this is the variable query and it contains all the books satisfying the above condition.
        res.render('books/index',{
            books:books,
            searchOptions: req.query
        })   
     }catch{
        res.redirect('/')
    }

})
//new book route- this render the new the page to add new book.
router.get('/new', async(req, res) => {
    renderNewPage(res, new Book())// this function was created because we have to this page again when we have error creating that book.
})

//create book route
router.post('/', upload.single('cover'), async(req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),//req.body... gives string. new Date convert into date
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try{
        const newBook = await book.save()
        res.redirect(`/books/${newBook.id}`)
    }catch{
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})
  function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName),err=>{
        if(err) console.error(err)
    })
  }
//show book route- used to show the routes of the book
router.get('/:id',async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
                               .populate('author')//now author is acting as a property in the book model
                               .exec()
        res.render('books/show',{ book:book})
    } catch {
        res.redirect('/')
    }
})
//edit book route- to show the edit page 
router.get('/:id/edit', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
    } catch {
        redirect('/')
    }
})
//update book route
router.put('/:id', upload.single('cover'), async(req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    let book
    try{
        book = await Book.findById(req.params.id)
        book.title= req.body.title,
        book.author= req.body.author,
        book.publishDate= new Date(req.body.publishDate),//req.body... gives string. new Date convert into date
        book.pageCount= req.body.pageCount,
        book.description= req.body.description
        if(fileName == null){
            book.coverImageName = book.coverImageName
        }else{
            book.coverImageName= fileName
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch(err){
        console.log(err)
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        if(book != null){
            renderEditPage(res, book, true)
        }else{
            redirect('/')
        }
    }
})
//delete book page
 router.delete('/:id',async (req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch  {
        if(book != null){
            res.render('books/show',{
                book: book,
                errorMessage:'could not remove book'
            })
        }else{
            res.redirect('/')
        }
    }
 })
  function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName),err=>{
        if(err) console.error(err)
    })
  }
// since rendering edit and new page is almost same.
async function renderNewPage(res, book, hasError = false){
    renderFormPage(res,book, 'new', hasError)
}
async function renderEditPage(res, book, hasError = false){
    renderFormPage(res,book, 'edit', hasError)
}
async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError){
            if (form=='edit'){
                params.errorMessage = 'Error Editing Book'
            }else{
                params.errorMessage = 'Error Creating Book'
            }
        console.error()
    }
        res.render(`books/${form}`,params)
    }catch{
        res.redirect('/books')
    }
}

module.exports= router