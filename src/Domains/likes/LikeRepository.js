class LikeRepository {
  async likeComment() { throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async unlikeComment() { throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async verifyCommentLikeExists() { throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async getLikesByThreadId() { throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
}

export default LikeRepository;
