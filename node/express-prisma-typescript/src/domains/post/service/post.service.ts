import { AddMediaInputDTO, CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';
import { PaginatedPosts } from './post.service.impl';

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<PostDTO>
  getPost: (userId: string, postId: string) => Promise<PostDTO>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<PaginatedPosts>
  getLatestFollowingPosts (userId: string, options: { limit?: number, before?: string, after?: string }): Promise<PaginatedPosts>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  getUploadMediaPresignedUrl: (data: AddMediaInputDTO) => Promise< { putObjectUrl: string, objectUrl: string }>
}
