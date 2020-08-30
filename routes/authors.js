// process of rendering it -- in the header page, the links were created which when clicked change the url and that change in url go to server. server has all the info in what changes what routes get to function. then the routes render the view model and do other bunch of stuff

const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// all authors route- It is rendered first when we click on the link authors, at that time the search box is empty therefore it renders all the authors present.
router.get('/', async (req, res) => {
   let searchOptions = {};
   if (req.query.name != null && req.query.name !== '') {
      searchOptions.name = new RegExp(req.query.name, 'i');
   } //reg exp is used to condunct the search even when user input a half name and 'i' here is used to ignore case sensitivity
   console.log(searchOptions);
   try {
      const authors = await Author.find(searchOptions);
      res.render('authors/index', {
         authors: authors,
         searchOptions: req.query,
      });
   } catch {
      res.redirect('/');
   }
});

// new authors route - displaying the form- it is used to display the form which helps to create an new author
router.get('/new', (req, res) => {
   res.render('../views/authors/new.ejs', { author: new Author() }); //when we render something, we dont need to write whole relative path bcoz render is hooked with views folder in server.
});

// create author route
router.post('/', async (req, res) => {
   const author = new Author({
      name: req.body.name,
   });
   try {
      const newAuthor = await author.save();
      res.redirect(`authors/${newAuthor.id}`);
   } catch {
      res.render('authors/new', {
         author: author,
         errorMessage: 'Error creating Author',
      }); // okay so when we render something the views dir name get hooked up with the path we send in render() in the server. Then the server go searching for layouts folder. in layouts we have partials of header and error included.
   }
});
// it is the view link- to show the author and its books
router.get('/:id', async (req, res) => {
   try {
      const author = await Author.findById(req.params.id);
      const books = await Book.find({ author: author.id }).limit(6).exec();
      res.render('authors/show', {
         author: author,
         booksByAuthor: books,
      });
   } catch {
      res.redirect('/');
   }
});
//it is the edit link - to show the page to edit the author details
router.get('/:id/edit', async (req, res) => {
   try {
      const author = await Author.findById(req.params.id);
      res.render('../views/authors/edit.ejs', { author: author });
   } catch {
      res.redirect('/authors');
   }
});
// it is the action edit link- when we click update this is called.
router.put('/:id', async (req, res) => {
   let author;
   try {
      author = await Author.findById(req.params.id);
      author.name = req.body.name;
      await author.save();
      res.redirect(`/authors/${author.id}`);
   } catch {
      if (author == null) {
         res.redirect('/');
      } else {
         res.render('authors/edit', {
            author: author,
            errorMessage: 'Error updating Author',
         });
      }
   }
});
// it is the delete link
router.delete('/:id', async (req, res) => {
   console.log('request recieved');
   let author;
   try {
      author = await Author.findById(req.params.id);
      await author.remove();
      console.log('removed');
      res.redirect(`/authors`);
   } catch {
      if (author == null) {
         res.redirect('/');
      } else {
         res.redirect(`authors`);
      }
   }
});
module.exports = router;
