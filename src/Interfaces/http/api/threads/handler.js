import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';
import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class ThreadsHandler {
  constructor(container) { this._container = container; }

  postThread = async (req, res, next) => {
    try {
      const addedThread = await this._container.getInstance(AddThreadUseCase.name)
        .execute(req.body, req.auth.id);
      res.status(201).json({ status: 'success', data: { addedThread } });
    } catch (error) { next(error); }
  };

  postComment = async (req, res, next) => {
    try {
      const addedComment = await this._container.getInstance(AddCommentUseCase.name)
        .execute(req.body, req.params.threadId, req.auth.id);
      res.status(201).json({ status: 'success', data: { addedComment } });
    } catch (error) { next(error); }
  };

  deleteComment = async (req, res, next) => {
    try {
      await this._container.getInstance(DeleteCommentUseCase.name)
        .execute(req.params.threadId, req.params.commentId, req.auth.id);
      res.json({ status: 'success' });
    } catch (error) { next(error); }
  };

  getThread = async (req, res, next) => {
    try {
      const thread = await this._container.getInstance(GetThreadDetailUseCase.name)
        .execute(req.params.threadId);
      res.json({ status: 'success', data: { thread } });
    } catch (error) { next(error); }
  };

  postReply = async (req, res, next) => {
    try {
      const addedReply = await this._container.getInstance(AddReplyUseCase.name)
        .execute(req.body, req.params.threadId, req.params.commentId, req.auth.id);
      res.status(201).json({ status: 'success', data: { addedReply } });
    } catch (error) { next(error); }
  };

  deleteReply = async (req, res, next) => {
    try {
      await this._container.getInstance(DeleteReplyUseCase.name).execute(
        req.params.threadId, req.params.commentId, req.params.replyId, req.auth.id,
      );
      res.json({ status: 'success' });
    } catch (error) { next(error); }
  };

  putLikeComment = async (req, res, next) => {
    try {
      await this._container.getInstance(ToggleLikeCommentUseCase.name).execute(
        req.params.threadId,
        req.params.commentId,
        req.auth.id,
      );
      res.json({ status: 'success' });
    } catch (error) { next(error); }
  };
}

export default ThreadsHandler;
