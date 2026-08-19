import AddedComment from '../comments/entities/AddedComment.js';
import NewComment from '../comments/entities/NewComment.js';
import CommentRepository from '../comments/CommentRepository.js';
import AddedReply from '../replies/entities/AddedReply.js';
import NewReply from '../replies/entities/NewReply.js';
import ReplyRepository from '../replies/ReplyRepository.js';
import AddedThread from '../threads/entities/AddedThread.js';
import NewThread from '../threads/entities/NewThread.js';
import ThreadRepository from '../threads/ThreadRepository.js';

describe('Forum domain entities', () => {
  it('membuat seluruh entitas dengan payload valid', () => {
    expect(new NewThread({ title: 'judul', body: 'isi' })).toMatchObject({ title: 'judul', body: 'isi' });
    expect(new AddedThread({ id: 'thread-1', title: 'judul', owner: 'user-1' })).toMatchObject({ id: 'thread-1' });
    expect(new NewComment({ content: 'komentar' })).toMatchObject({ content: 'komentar' });
    expect(new AddedComment({ id: 'comment-1', content: 'komentar', owner: 'user-1' })).toMatchObject({ id: 'comment-1' });
    expect(new NewReply({ content: 'balasan' })).toMatchObject({ content: 'balasan' });
    expect(new AddedReply({ id: 'reply-1', content: 'balasan', owner: 'user-1' })).toMatchObject({ id: 'reply-1' });
  });

  it.each([
    [() => new NewThread({ title: 'judul' }), 'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new NewThread({ title: 1, body: 'isi' }), 'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'],
    [() => new AddedThread({ id: 'id', title: 'judul' }), 'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new AddedThread({ id: 1, title: 'judul', owner: 'user' }), 'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'],
    [() => new NewComment({}), 'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new NewComment({ content: 1 }), 'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'],
    [() => new AddedComment({ id: 'id', content: 'isi' }), 'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new AddedComment({ id: 1, content: 'isi', owner: 'user' }), 'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'],
    [() => new NewReply({}), 'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new NewReply({ content: 1 }), 'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'],
    [() => new AddedReply({ id: 'id', content: 'isi' }), 'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'],
    [() => new AddedReply({ id: 1, content: 'isi', owner: 'user' }), 'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'],
  ])('menolak payload invalid %#', (factory, message) => expect(factory).toThrow(message));
});

describe('Forum repository interfaces', () => {
  it('menolak seluruh method ThreadRepository yang belum diimplementasikan', async () => {
    const repository = new ThreadRepository();
    await expect(repository.addThread()).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyThreadExists()).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getThreadById()).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('menolak seluruh method CommentRepository yang belum diimplementasikan', async () => {
    const repository = new CommentRepository();
    await expect(repository.addComment()).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyCommentExists()).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyCommentOwner()).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.deleteComment()).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getCommentsByThreadId()).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('menolak seluruh method ReplyRepository yang belum diimplementasikan', async () => {
    const repository = new ReplyRepository();
    await expect(repository.addReply()).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyReplyExists()).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyReplyOwner()).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.deleteReply()).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getRepliesByThreadId()).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
