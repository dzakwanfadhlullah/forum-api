import { describe, it, expect, vi } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly when comment is not liked yet', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyCommentLikeExists = vi.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(threadId, commentId, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.verifyCommentLikeExists).toHaveBeenCalledWith(commentId, userId);
    expect(mockLikeRepository.likeComment).toHaveBeenCalledWith(commentId, userId);
    expect(mockLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should orchestrating the unlike comment action correctly when comment is already liked', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyCommentLikeExists = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.likeComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(threadId, commentId, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.verifyCommentLikeExists).toHaveBeenCalledWith(commentId, userId);
    expect(mockLikeRepository.unlikeComment).toHaveBeenCalledWith(commentId, userId);
    expect(mockLikeRepository.likeComment).not.toHaveBeenCalled();
  });
});
