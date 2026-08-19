import request from 'supertest';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('Forum API', () => {
  let app;
  let ownerToken;
  let otherToken;

  beforeAll(async () => {
    app = await createServer(container);
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    ownerToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
    otherToken = await tokenManager.createAccessToken({ id: 'user-456', username: 'johndoe' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => pool.end());

  it('menjalankan alur thread, komentar, reply, like, soft delete, dan detail secara utuh', async () => {
    const threadResponse = await request(app).post('/threads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'sebuah thread', body: 'sebuah body thread' });
    expect(threadResponse.status).toBe(201);
    expect(threadResponse.body.data.addedThread).toMatchObject({ title: 'sebuah thread', owner: 'user-123' });
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app).post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${otherToken}`).send({ content: 'sebuah comment' });
    expect(commentResponse.status).toBe(201);
    const commentId = commentResponse.body.data.addedComment.id;

    // Like comment by owner (1 like)
    const likeResponse = await request(app).put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body.status).toBe('success');

    // Check detail thread has likeCount = 1
    const detailBeforeUnlike = await request(app).get(`/threads/${threadId}`);
    expect(detailBeforeUnlike.status).toBe(200);
    expect(detailBeforeUnlike.body.data.thread.comments[0].likeCount).toBe(1);

    // Unlike comment by owner (0 likes)
    const unlikeResponse = await request(app).put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(unlikeResponse.status).toBe(200);
    expect(unlikeResponse.body.status).toBe('success');

    const replyResponse = await request(app).post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${ownerToken}`).send({ content: 'sebuah balasan' });
    expect(replyResponse.status).toBe(201);
    expect(replyResponse.body.data.addedReply).toMatchObject({ content: 'sebuah balasan', owner: 'user-123' });
    const replyId = replyResponse.body.data.addedReply.id;

    const deleteReplyResponse = await request(app).delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(deleteReplyResponse.status).toBe(200);

    const deleteCommentResponse = await request(app).delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteCommentResponse.status).toBe(200);

    const detail = await request(app).get(`/threads/${threadId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.thread.comments[0].content).toBe('**komentar telah dihapus**');
    expect(detail.body.data.thread.comments[0].likeCount).toBe(0);
    expect(detail.body.data.thread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
  });

  it('menolak resource terbatas tanpa token atau dengan token tidak valid', async () => {
    expect((await request(app).post('/threads').send({ title: 'judul', body: 'isi' })).status).toBe(401);
    expect((await request(app).post('/threads').set('Authorization', 'Bearer salah').send({ title: 'judul', body: 'isi' })).status).toBe(401);
    expect((await request(app).put('/threads/thread-123/comments/comment-123/likes').send()).status).toBe(401);
  });

  it.each([
    [{ body: 'isi' }, 400],
    [{ title: 123, body: 'isi' }, 400],
  ])('memvalidasi payload thread %#', async (payload, status) => {
    const response = await request(app).post('/threads').set('Authorization', `Bearer ${ownerToken}`).send(payload);
    expect(response.status).toBe(status);
    expect(response.body.message).toBeTruthy();
  });

  it('mengembalikan 404 untuk thread, komentar, reply, dan like yang tidak ada', async () => {
    const headers = { Authorization: `Bearer ${ownerToken}` };
    expect((await request(app).get('/threads/thread-missing')).status).toBe(404);
    expect((await request(app).post('/threads/thread-missing/comments').set(headers).send({ content: 'x' })).status).toBe(404);
    expect((await request(app).put('/threads/thread-missing/comments/comment-123/likes').set(headers)).status).toBe(404);

    await ThreadsTableTestHelper.addThread({});
    expect((await request(app).delete('/threads/thread-123/comments/comment-missing').set(headers)).status).toBe(404);
    expect((await request(app).post('/threads/thread-123/comments/comment-missing/replies').set(headers).send({ content: 'x' })).status).toBe(404);
    expect((await request(app).put('/threads/thread-123/comments/comment-missing/likes').set(headers)).status).toBe(404);

    await CommentsTableTestHelper.addComment({});
    expect((await request(app).delete('/threads/thread-123/comments/comment-123/replies/reply-missing').set(headers)).status).toBe(404);
  });

  it('menolak penghapusan milik pengguna lain', async () => {
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
    await RepliesTableTestHelper.addReply({});

    const deleteCommentResponse = await request(app).delete('/threads/thread-123/comments/comment-123')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteCommentResponse.status).toBe(403);

    const deleteReplyResponse = await request(app).delete('/threads/thread-123/comments/comment-123/replies/reply-123')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteReplyResponse.status).toBe(403);
  });

  it.each([
    ['/threads/thread-123/comments', {}],
    ['/threads/thread-123/comments', { content: 12 }],
    ['/threads/thread-123/comments/comment-123/replies', {}],
    ['/threads/thread-123/comments/comment-123/replies', { content: 12 }],
  ])('memvalidasi payload POST %s', async (path, payload) => {
    await ThreadsTableTestHelper.addThread({});
    if (path.includes('replies')) await CommentsTableTestHelper.addComment({});
    const response = await request(app).post(path).set('Authorization', `Bearer ${ownerToken}`).send(payload);
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
  });

  it('mengurutkan komentar dan reply berdasarkan waktu', async () => {
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({ id: 'comment-late', date: '2024-01-02T00:00:00Z' });
    await CommentsTableTestHelper.addComment({ id: 'comment-early', date: '2024-01-01T00:00:00Z' });
    await RepliesTableTestHelper.addReply({ id: 'reply-late', commentId: 'comment-early', date: '2024-01-02T00:00:00Z' });
    await RepliesTableTestHelper.addReply({ id: 'reply-early', commentId: 'comment-early', date: '2024-01-01T00:00:00Z' });
    const thread = (await request(app).get('/threads/thread-123')).body.data.thread;
    expect(thread.comments.map(({ id }) => id)).toEqual(['comment-early', 'comment-late']);
    expect(thread.comments[0].replies.map(({ id }) => id)).toEqual(['reply-early', 'reply-late']);
  });
});
