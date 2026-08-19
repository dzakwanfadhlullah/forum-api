class NewThread {
  constructor(payload) {
    const { title, body } = payload;
    if (!title || !body) throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
    this.title = title;
    this.body = body;
  }
}

export default NewThread;
