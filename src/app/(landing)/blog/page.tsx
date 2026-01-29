"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Heart, MessageCircle, Eye, Calendar, User, Building, Tag } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  company?: {
    _id: string;
    name: string;
    logo?: string;
  };
  imageUrl?: string;
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  authorType: "user" | "employer";
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  likes: string[];
  createdAt: string;
}

export default function BlogPage() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", content: "", imageUrl: "", tags: "" });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiClient.get<{ user: any }>("/api/auth/profile");
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ blogs: Blog[] }>("/api/blogs?limit=20");
      setBlogs(response.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId: string) => {
    try {
      const response = await apiClient.get<{ comments: Comment[] }>(`/api/comments?blog=${blogId}`);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/blog");
      toast.info("Please log in to like blogs");
      return;
    }

    try {
      const response = await apiClient.post<{ likes: number; isLiked: boolean }>(`/api/blogs/${blogId}/like`);
      // Update the blog in the list
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                likes: response.isLiked
                  ? [...blog.likes, user._id]
                  : blog.likes.filter((id) => id !== user._id),
              }
            : blog
        )
      );
    } catch (error) {
      toast.error("Failed to like blog");
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !selectedBlog) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await apiClient.post("/api/comments", {
        content: newComment,
        blog: selectedBlog._id,
      });
      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments(selectedBlog._id);
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleCreateBlog = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/blog");
      return;
    }

    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const tags = newBlog.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await apiClient.post<{ blog: Blog; message: string }>("/api/blogs", {
        title: newBlog.title.trim(),
        content: newBlog.content.trim(),
        imageUrl: newBlog.imageUrl.trim() || undefined,
        tags,
      });

      toast.success(response.message || "Blog created successfully!");
      setIsCreateDialogOpen(false);
      setNewBlog({ title: "", content: "", imageUrl: "", tags: "" });
      await fetchBlogs();
    } catch (error) {
      console.error("Blog creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create blog";
      toast.error(errorMessage);
    }
  };

  const openComments = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsCommentDialogOpen(true);
    fetchComments(blog._id);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Blog & <span className="text-[#B260E6]">Insights</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Share your experiences, achievements, and insights with the JobSync community
          </p>
          {isAuthenticated && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white px-8 py-6 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newBlog.title}
                      onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newBlog.content}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      placeholder="Write your blog post..."
                      rows={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={newBlog.imageUrl}
                      onChange={(e) => setNewBlog({ ...newBlog, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newBlog.tags}
                      onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                      placeholder="career, success, tips"
                    />
                  </div>
                  <Button onClick={handleCreateBlog} className="w-full">
                    Publish
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Blog Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No blogs yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <Card key={blog._id} className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar>
                      {blog.author.profileImage && (
                        <AvatarImage src={blog.author.profileImage} alt={blog.author.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                        {getInitials(blog.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{blog.author.name}</p>
                        {blog.company && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{blog.company.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Blog Image */}
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Blog Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{blog.title}</h3>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{blog.content}</p>

                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(blog._id)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-[#ED84A5] transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isAuthenticated && blog.likes.includes(user?._id)
                              ? "fill-[#ED84A5] text-[#ED84A5]"
                              : ""
                          }`}
                        />
                        <span>{blog.likes.length}</span>
                      </button>
                      <button
                        onClick={() => openComments(blog)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-[#B260E6] transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Comment</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <Eye className="h-5 w-5" />
                        <span>{blog.views}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Comments Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            {selectedBlog && (
              <>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedBlog.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{selectedBlog.content}</p>
                </div>
                <div className="space-y-4 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="flex space-x-3">
                        <Avatar>
                          {comment.author.profileImage && (
                            <AvatarImage src={comment.author.profileImage} alt={comment.author.name} />
                          )}
                          <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white text-xs">
                            {getInitials(comment.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.author.name}</p>
                            <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                    />
                    <Button onClick={handleSubmitComment} className="w-full">
                      Post Comment
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">Please log in to comment</p>
                    <Button onClick={() => router.push("/auth/login?redirect=/blog")}>
                      Sign In
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
