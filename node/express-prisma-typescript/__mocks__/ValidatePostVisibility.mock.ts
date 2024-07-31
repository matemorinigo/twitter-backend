import { FollowRepositoryImpl } from '../src/domains/follower/repository/follow.repository.impl';
import { db } from '../src/utils';
import { UserRepositoryImpl } from '../src/domains/user/repository';
import { PostRepositoryImpl } from '../src/domains/post/repository';

const ValidatePostVisibilityMock = {
  followRepository: new FollowRepositoryImpl(db),
  userRepository: new UserRepositoryImpl(db),
  postRepository: new PostRepositoryImpl(db),
  validateUserCanSeePost: jest.fn(),
  validateUserCanSeePosts: jest.fn()
}

export default ValidatePostVisibilityMock
