const express = require('express');
const router = express.Router();
const { handleCreateBook, handleGetAllBooks, handleFindBookById, handleUpdateBook, handleDeleteBook } = require('./bookFunction');
const {
    createComment,
    getAllComments,
    updateComment,
    deleteComment,
    deleteAllComments
} = require('./bookFunction');

router.post('/', handleCreateBook);
router.get('/', handleGetAllBooks);
router.get('/:id', handleFindBookById);
router.put('/:id', handleUpdateBook);
router.delete('/:id', handleDeleteBook);

router.post('/:bookId/comments', createComment);
router.get('/:bookId/comments', getAllComments);
router.put('/:bookId/comments/:commentId', updateComment);
router.delete('/:bookId/comments/:commentId', deleteComment);
router.delete('/:bookId/comments', deleteAllComments);

module.exports = router;
