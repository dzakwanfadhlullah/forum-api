import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('Forum repositories PostgreSQL', () => {
  const idGenerator = () => '123';
  const threads = new ThreadRepositoryPostgres(pool, idGenerator);
  const comments = new CommentRepositoryPostgres(pool, idGenerator);
  const replies = new ReplyRepositoryPostgres(pool, idGenerator);
  const likes = new LikeRepositoryPostgres(pool, idGenerator);

  beforeEach(async () => UsersTableTestHelper.addUser({}));
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => pool.end());

  it('menyimpan, memverifikasi, dan mengambil thread', async () => {
    const added = await threads.addThread({ title: 'judul', body: 'isi' }, 'user-123');
    expect(added).toStrictEqual(new AddedThread({ id: 'thread-123', title: 'judul', owner: 'user-123' }));
    expect(await ThreadsTableTestHelper.findById('thread-123')).toHaveLength(1);
    await expect(threads.verifyThreadExists('thread-123')).resolves.not.toThrow();
    expect(await threads.getThreadById('thread-123')).toMatchObject({ id: 'thread-123', username: 'dicoding' });
    await expect(threads.verifyThreadExists('thread-missing')).rejects.toThrow(NotFoundError);
    await expect(threads.getThreadById('thread-missing')).rejects.toThrow(NotFoundError);
  });

  it('menjalankan seluruh operasi komentar', async () => {
    await ThreadsTableTestHelper.addThread({});
    const added = await comments.addComment({ content: 'komentar' }, 'thread-123', 'user-123');
    expect(added).toStrictEqual(new AddedComment({ id: 'comment-123', content: 'komentar', owner: 'user-123' }));
    await expect(comments.verifyCommentExists('comment-123', 'thread-123')).resolves.not.toThrow();
    await expect(comments.verifyCommentExists('missing', 'thread-123')).rejects.toThrow(NotFoundError);
    await expect(comments.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    await expect(comments.verifyCommentOwner('comment-123', 'user-other')).rejects.toThrow(AuthorizationError);
    await expect(comments.verifyCommentOwner('missing', 'user-123')).rejects.toThrow(NotFoundError);
    expect(await comments.getCommentsByThreadId('thread-123')).toHaveLength(1);
    await comments.deleteComment('comment-123');
    expect((await CommentsTableTestHelper.findById('comment-123'))[0].is_delete).toBe(true);
  });

  it('menjalankan seluruh operasi reply', async () => {
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
    const added = await replies.addReply({ content: 'balasan' }, 'comment-123', 'user-123');
    expect(added).toStrictEqual(new AddedReply({ id: 'reply-123', content: 'balasan', owner: 'user-123' }));
    await expect(replies.verifyReplyExists('reply-123', 'comment-123')).resolves.not.toThrow();
    await expect(replies.verifyReplyExists('missing', 'comment-123')).rejects.toThrow(NotFoundError);
    await expect(replies.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    await expect(replies.verifyReplyOwner('reply-123', 'user-other')).rejects.toThrow(AuthorizationError);
    await expect(replies.verifyReplyOwner('missing', 'user-123')).rejects.toThrow(NotFoundError);
    expect(await replies.getRepliesByThreadId('thread-123')).toHaveLength(1);
    await replies.deleteReply('reply-123');
    expect((await RepliesTableTestHelper.findById('reply-123'))[0].is_delete).toBe(true);
  });

  it('menjalankan seluruh operasi like/unlike komentar', async () => {
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});

    // verifyCommentLikeExists (false)
    expect(await likes.verifyCommentLikeExists('comment-123', 'user-123')).toBe(false);

    // likeComment
    await likes.likeComment('comment-123', 'user-123');
    expect(await likes.verifyCommentLikeExists('comment-123', 'user-123')).toBe(true);
    expect(await LikesTableTestHelper.findLike('comment-123', 'user-123')).toHaveLength(1);

    // getLikesByThreadId
    const threadLikes = await likes.getLikesByThreadId('thread-123');
    expect(threadLikes).toHaveLength(1);
    expect(threadLikes[0].comment_id).toBe('comment-123');

    // unlikeComment
    await likes.unlikeComment('comment-123', 'user-123');
    expect(await likes.verifyCommentLikeExists('comment-123', 'user-123')).toBe(false);
    expect(await LikesTableTestHelper.findLike('comment-123', 'user-123')).toHaveLength(0);
  });
});
