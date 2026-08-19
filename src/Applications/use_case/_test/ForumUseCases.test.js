/* eslint-disable camelcase -- meniru nama kolom PostgreSQL pada data repository */
import { vi } from 'vitest';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import AddCommentUseCase from '../AddCommentUseCase.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import AddThreadUseCase from '../AddThreadUseCase.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('Forum use cases', () => {
  it('AddThreadUseCase mengirim entitas dan owner ke repository', async () => {
    const expected = new AddedThread({ id: 'thread-1', title: 'judul', owner: 'user-1' });
    const repository = { addThread: vi.fn().mockResolvedValue(expected) };
    const result = await new AddThreadUseCase({ threadRepository: repository })
      .execute({ title: 'judul', body: 'isi' }, 'user-1');
    expect(result).toStrictEqual(expected);
    expect(repository.addThread).toHaveBeenCalledWith(expect.objectContaining({ title: 'judul', body: 'isi' }), 'user-1');
  });

  it('AddCommentUseCase memverifikasi thread sebelum menyimpan komentar', async () => {
    const threadRepository = { verifyThreadExists: vi.fn() };
    const expected = new AddedComment({ id: 'comment-1', content: 'isi', owner: 'user-1' });
    const commentRepository = { addComment: vi.fn().mockResolvedValue(expected) };
    const result = await new AddCommentUseCase({ threadRepository, commentRepository })
      .execute({ content: 'isi' }, 'thread-1', 'user-1');
    expect(result).toStrictEqual(expected);
    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
  });

  it('DeleteCommentUseCase menjalankan validasi berurutan dan soft delete', async () => {
    const threadRepository = { verifyThreadExists: vi.fn() };
    const commentRepository = { verifyCommentExists: vi.fn(), verifyCommentOwner: vi.fn(), deleteComment: vi.fn() };
    await new DeleteCommentUseCase({ threadRepository, commentRepository }).execute('thread-1', 'comment-1', 'user-1');
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1', 'thread-1');
    expect(commentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(commentRepository.deleteComment).toHaveBeenCalledWith('comment-1');
  });

  it('AddReplyUseCase memverifikasi parent sebelum menyimpan reply', async () => {
    const threadRepository = { verifyThreadExists: vi.fn() };
    const commentRepository = { verifyCommentExists: vi.fn() };
    const expected = new AddedReply({ id: 'reply-1', content: 'isi', owner: 'user-1' });
    const replyRepository = { addReply: vi.fn().mockResolvedValue(expected) };
    const result = await new AddReplyUseCase({ threadRepository, commentRepository, replyRepository })
      .execute({ content: 'isi' }, 'thread-1', 'comment-1', 'user-1');
    expect(result).toStrictEqual(expected);
    expect(replyRepository.addReply).toHaveBeenCalledWith(expect.objectContaining({ content: 'isi' }), 'comment-1', 'user-1');
  });

  it('DeleteReplyUseCase memvalidasi parent, owner, lalu soft delete', async () => {
    const threadRepository = { verifyThreadExists: vi.fn() };
    const commentRepository = { verifyCommentExists: vi.fn() };
    const replyRepository = { verifyReplyExists: vi.fn(), verifyReplyOwner: vi.fn(), deleteReply: vi.fn() };
    await new DeleteReplyUseCase({ threadRepository, commentRepository, replyRepository })
      .execute('thread-1', 'comment-1', 'reply-1', 'user-1');
    expect(replyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-1', 'comment-1');
    expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-1', 'user-1');
    expect(replyRepository.deleteReply).toHaveBeenCalledWith('reply-1');
  });

  it('GetThreadDetailUseCase menyusun komentar, reply, dan likeCount termasuk data terhapus', async () => {
    const threadRepository = {
      verifyThreadExists: vi.fn(),
      getThreadById: vi.fn().mockResolvedValue({ id: 'thread-1', title: 'judul' }),
    };
    const commentRepository = { getCommentsByThreadId: vi.fn().mockResolvedValue([
      { id: 'comment-1', username: 'andi', date: 'date-1', content: 'asli', is_delete: true },
      { id: 'comment-2', username: 'budi', date: 'date-2', content: 'aktif', is_delete: false },
    ]) };
    const replyRepository = { getRepliesByThreadId: vi.fn().mockResolvedValue([
      { id: 'reply-1', comment_id: 'comment-1', username: 'budi', date: 'date-3', content: 'asli', is_delete: true },
      { id: 'reply-2', comment_id: 'comment-2', username: 'andi', date: 'date-4', content: 'aktif', is_delete: false },
    ]) };
    const likeRepository = { getLikesByThreadId: vi.fn().mockResolvedValue([
      { id: 'like-1', comment_id: 'comment-1', user_id: 'user-1' },
      { id: 'like-2', comment_id: 'comment-1', user_id: 'user-2' },
      { id: 'like-3', comment_id: 'comment-2', user_id: 'user-1' },
    ]) };

    const result = await new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
      likeRepository,
    }).execute('thread-1');

    expect(result.comments[0].content).toBe('**komentar telah dihapus**');
    expect(result.comments[0].likeCount).toBe(2);
    expect(result.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    expect(result.comments[1].content).toBe('aktif');
    expect(result.comments[1].likeCount).toBe(1);
    expect(result.comments[1].replies[0].content).toBe('aktif');
  });
});
