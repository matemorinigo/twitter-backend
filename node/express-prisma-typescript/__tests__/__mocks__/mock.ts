import { PostRepositoryImpl } from '@domains/post/repository';
import { db, ValidatePostVisibility } from '@utils';
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository';
import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl';

const postRepository = new PostRepositoryImpl(db)
const commentRepository = new CommentRepositoryImpl(db)
const validatePostVisibility = new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db), postRepository)

export const commentService = new CommentServiceImpl(commentRepository, postRepository, validatePostVisibility)

export const validateUserCanSeePostMocked = jest.spyOn(validatePostVisibility, 'validateUserCanSeePost')
export const validateUserCanSeePostsMocked = jest.spyOn(validatePostVisibility, 'validateUserCanSeePosts')
export const commentMocked = jest.spyOn(commentRepository, 'comment')