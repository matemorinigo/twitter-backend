import { AddMediaInputDTO, CreatePostInputDTO, PostDTO } from '../dto';

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<PostDTO>
  getPost: (userId: string, postId: string) => Promise<PostDTO>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<PostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<PostDTO[]>
  getUploadMediaPresignedUrl: (data: AddMediaInputDTO) => Promise< { putObjectUrl: string, objectUrl: string }>
}
