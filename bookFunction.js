const { Book, Genre } = require("./bookModel")

async function handleCreateBook(req, res) {
    try {
        const { isbn, title, subTitle, publish_date, publisher, pages, price, description, website, comments, genre } = req.body;

        const existingBook = await Book.findOne({ isbn });

        if (existingBook) {
            return res.status(409).json({ error: 'ISBN already exists' });
        }

        const genreExists = await Genre.exists({ _id: genre });
        if (!genreExists) {
            return res.status(400).json({ error: 'Invalid genre ID' });
        }

        const book = new Book({ isbn, title, subTitle, publish_date, publisher, pages, price, description, website, comments, genre });
        const createdBook = await book.save();

        res.status(201).json({ message: "Book created successfully", book: createdBook });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function handleGetAllBooks(req, res) {
    try {
        const { maxPrice, genre, ...otherQueryParams } = req.query;

        const query = {};

        if (maxPrice && !isNaN(maxPrice)) {
            query.price = { $lt: parseFloat(maxPrice) };
        }

        if (genre) {
            query.genre = genre;
        }

        const books = await Book.find(query);

        if (books.length > 0) {
            res.status(200).json(books);
        } else {
            res.status(404).json({ message: 'Can not find book' });
        }
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function handleFindBookById(req, res) {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleDeleteBook(req, res) {
    try {
        const id = req.params.id;
        const deletedBook = await Book.findByIdAndDelete(id);

        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book deleted successfully',
            deletedBook
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function handleUpdateBook(req, res) {
    try {
        const bookId = req.params.id;
        const updateData = req.body;

        const allowedUpdates = ['title', 'subTitle', 'publisher', 'pages', 'price', 'description', 'website', 'comments'];
        const updates = Object.keys(updateData).filter(key => allowedUpdates.includes(key));

        const updatedBook = await Book.findByIdAndUpdate(bookId, { $set: updateData }, { new: true, runValidators: true });

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createGenre(req, res) {
    try {
        const { name } = req.body;

        const existingGenre = await Genre.findOne({ name });
        if (existingGenre) {
            return res.status(409).json({ error: 'Genre already exists' });
        }

        const genre = new Genre({ name });
        const savedGenre = await genre.save();

        res.status(201).json({ message: 'Genre created successfully', genre: savedGenre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllGenres(req, res) {
    try {
        const genres = await Genre.find();
        res.status(200).json(genres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getGenreById(req, res) {
    try {
        const genreId = req.params.id;
        const genre = await Genre.findById(genreId);

        if (!genre) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.status(200).json(genre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateGenre(req, res) {
    try {
        const genreId = req.params.id;
        const { name } = req.body;

        const genre = await Genre.findByIdAndUpdate(genreId, { name }, { new: true, runValidators: true });

        if (!genre) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.status(200).json({ message: 'Genre updated successfully', genre });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteGenre(req, res) {
    try {
        const genreId = req.params.id;

        const genre = await Genre.findById(genreId);
        if (!genre) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        await Book.updateMany({ genre: genreId }, { $unset: { genre: "" } });

        const deletedGenre = await Genre.deleteOne({ _id: genreId });

        if (deletedGenre.deletedCount === 0) {
            return res.status(404).json({ error: 'Genre not found' });
        }

        res.status(200).json({ message: 'Genre deleted successfully' });
    } catch (error) {
        console.error("Error deleting genre:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function createComment(req, res) {
    try {
        const bookId = req.params.bookId;
        const { rating, comment, author } = req.body;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        book.comments.push({ rating, comment, author });
        const updatedBook = await book.save();

        res.status(201).json({ message: 'Comment added successfully', book: updatedBook });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllComments(req, res) {
    try {
        const bookId = req.params.bookId;
        const book = await Book.findById(bookId).select('comments');

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json(book.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateComment(req, res) {
    try {
        const bookId = req.params.bookId;
        const commentId = req.params.commentId;
        const { rating, comment, author } = req.body;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const commentToUpdate = book.comments.id(commentId);
        if (!commentToUpdate) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        commentToUpdate.rating = rating || commentToUpdate.rating;
        commentToUpdate.comment = comment || commentToUpdate.comment;
        commentToUpdate.author = author || commentToUpdate.author;

        const updatedBook = await book.save();
        res.status(200).json({ message: 'Comment updated successfully', book: updatedBook });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteComment(req, res) {
    try {
        const bookId = req.params.bookId;
        const commentId = req.params.commentId;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const commentIndex = book.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        book.comments.splice(commentIndex, 1);
        await book.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function deleteAllComments(req, res) {
    try {
        const bookId = req.params.bookId;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        book.comments = [];
        const updatedBook = await book.save();

        res.status(200).json({
            message: 'All comments deleted successfully',
            book: updatedBook
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    handleCreateBook,
    handleGetAllBooks,
    handleFindBookById,
    handleDeleteBook,
    handleUpdateBook,
    createGenre,
    getAllGenres,
    getGenreById,
    updateGenre,
    deleteGenre,
    createComment,
    getAllComments,
    updateComment,
    deleteAllComments,
    deleteComment
}; 
