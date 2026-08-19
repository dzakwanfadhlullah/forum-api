import express from 'express';
import authentication from '../../middleware/authentication.js';

const createThreadsRouter = (handler, container) => {
  const router = express.Router();
  const restrict = authentication(container);

  router.post('/', restrict, handler.postThread);
  router.get('/:threadId', handler.getThread);
  router.post('/:threadId/comments', restrict, handler.postComment);
  router.delete('/:threadId/comments/:commentId', restrict, handler.deleteComment);
  router.post('/:threadId/comments/:commentId/replies', restrict, handler.postReply);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', restrict, handler.deleteReply);
  router.put('/:threadId/comments/:commentId/likes', restrict, handler.putLikeComment);
  return router;
};

export default createThreadsRouter;
