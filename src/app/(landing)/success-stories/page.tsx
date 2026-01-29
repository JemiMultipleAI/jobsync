"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Plus, ArrowRight, Calendar, User, Eye, EyeOff, MessageCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default function SuccessStoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  // Check authentication status
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

  const fetchComments = async (storyId: string) => {
    try {
      const response = await apiClient.get<{ comments: Comment[] }>(`/api/comments?successStory=${storyId}`);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !selectedStory) {
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
        successStory: selectedStory.id,
      });
      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments(selectedStory.id);
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const openComments = (story: any) => {
    setSelectedStory(story);
    setIsCommentDialogOpen(true);
    fetchComments(story.id);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSubmitStory = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/success-stories/submit");
      toast.info("Please log in to submit your success story");
      return;
    }
    router.push("/success-stories/submit");
  };

  const successStories = [
    {
      id: 1,
      title: "From Mining to Tech: A Career Transformation",
      story: "After 10 years in mining, I transitioned to tech through JobSync's training programs. Today I'm a software developer at a leading Australian company.",
      author: "Anonymous",
      isAnonymous: true,
      date: "2024-01-20",
      industry: "Technology",
    },
    {
      id: 2,
      title: "Finding My Dream Job in Healthcare",
      story: "JobSync helped me connect with the perfect healthcare role. The verification process made it easy to showcase my credentials.",
      author: "Sarah M.",
      isAnonymous: false,
      date: "2024-01-18",
      industry: "Healthcare",
    },
    {
      id: 3,
      title: "Building a Career in Construction",
      story: "As a new immigrant, JobSync made it simple to verify my qualifications and find work in Australia's construction industry.",
      author: "Anonymous",
      isAnonymous: true,
      date: "2024-01-15",
      industry: "Construction",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Success <span className="text-[#B260E6]">Stories</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from workers who found their perfect job through JobSync
          </p>
        </div>

        {/* Submit Story Button */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={handleSubmitStory}
            className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white px-8 py-6 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Share Your Success Story
          </Button>
        </div>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {successStories.map((story) => (
            <Card key={story.id} className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] rounded-full text-sm font-medium">
                    {story.industry}
                  </span>
                  {story.isAnonymous && (
                    <span title="Anonymous story">
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{story.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-4">{story.story}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {story.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(story.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => openComments(story)}
                    variant="outline"
                    className="flex-1 group"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comments
                  </Button>
                  <Button variant="outline" className="flex-1 group">
                    Read Full Story
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Have a success story to share? We'd love to hear from you!
          </p>
          <Button
            onClick={handleSubmitStory}
            variant="outline"
            className="border-[#B260E6] text-[#B260E6] hover:bg-[#B260E6] hover:text-white hover:border-[#B260E6]"
          >
            Submit Your Story
          </Button>
        </div>

        {/* Comments Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            {selectedStory && (
              <>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedStory.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{selectedStory.story}</p>
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
                    <p className="text-gray-600 dark:text-gray-300 mb-2">Please log in to comment</p>
                    <Button onClick={() => router.push("/auth/login?redirect=/success-stories")}>
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
