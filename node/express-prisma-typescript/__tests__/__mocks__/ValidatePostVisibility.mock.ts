import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { db } from '@utils';
import { UserRepositoryImpl } from '@domains/user/repository';
import { PostRepositoryImpl } from '@domains/post/repository';

const ValidatePostVisibilityMock = {
  followRepository: new FollowRepositoryImpl(db),
  userRepository: new UserRepositoryImpl(db),
  postRepository: new PostRepositoryImpl(db),
  validateUserCanSeePost: jest.fn(),
  validateUserCanSeePosts: jest.fn()
}

export default ValidatePostVisibilityMock
