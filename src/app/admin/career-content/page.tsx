"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, BookOpen, GraduationCap, Eye } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardCard from "@/components/shared/DashboardCard";

interface CareerArticle {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  published: boolean;
  views: number;
  createdAt: string;
}

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  content?: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  published: boolean;
  badgeName?: string;
  badgeIcon?: string;
  price?: number;
  free: boolean;
  createdAt: string;
}

export default function CareerContentPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("articles");
  const [articles, setArticles] = useState<CareerArticle[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingArticle, setEditingArticle] = useState<CareerArticle | null>(null);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "article" | "program"; id: string } | null>(null);

  const [articleFormData, setArticleFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Resume Tips",
    author: "JobSync Team",
    published: false,
    featuredImage: "",
    tags: [] as string[],
  });

  const [programFormData, setProgramFormData] = useState({
    title: "",
    description: "",
    content: "",
    duration: "",
    level: "Beginner",
    format: "Online",
    category: "",
    published: false,
    featuredImage: "",
    badgeName: "",
    badgeIcon: "",
    price: 0,
    free: true,
  });

  const fetchArticles = useCallback(async () => {
    try {
      const response = await apiClient.get<{ articles: CareerArticle[] }>("/api/career-articles?admin=true&limit=100");
      setArticles(response.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    }
  }, [toast]);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await apiClient.get<{ programs: TrainingProgram[] }>("/api/training-programs?admin=true&limit=100");
      setPrograms(response.programs || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load training programs");
    }
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchPrograms()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchArticles, fetchPrograms]);

  const handleCreateArticle = () => {
    setIsEditMode(false);
    setEditingArticle(null);
    setArticleFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "Resume Tips",
      author: "JobSync Team",
      published: false,
      featuredImage: "",
      tags: [],
    });
    setIsArticleDialogOpen(true);
  };

  const handleEditArticle = (article: CareerArticle) => {
    setIsEditMode(true);
    setEditingArticle(article);
    setArticleFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      published: article.published,
      featuredImage: "",
      tags: [],
    });
    setIsArticleDialogOpen(true);
  };

  const handleSaveArticle = async () => {
    try {
      if (isEditMode && editingArticle) {
        await apiClient.put(`/api/career-articles/${editingArticle._id}`, articleFormData);
        toast.success("Article updated successfully");
      } else {
        await apiClient.post("/api/career-articles", articleFormData);
        toast.success("Article created successfully");
      }
      setIsArticleDialogOpen(false);
      fetchArticles();
    } catch (error) {
      toast.error("Failed to save article");
    }
  };

  const handleCreateProgram = () => {
    setIsEditMode(false);
    setEditingProgram(null);
    setProgramFormData({
      title: "",
      description: "",
      content: "",
      duration: "",
      level: "Beginner",
      format: "Online",
      category: "",
      published: false,
      featuredImage: "",
      badgeName: "",
      badgeIcon: "",
      price: 0,
      free: true,
    });
    setIsProgramDialogOpen(true);
  };

  const handleEditProgram = (program: TrainingProgram) => {
    setIsEditMode(true);
    setEditingProgram(program);
    setProgramFormData({
      title: program.title,
      description: program.description,
      content: program.content || "",
      duration: program.duration,
      level: program.level,
      format: program.format,
      category: program.category,
      published: program.published,
      featuredImage: "",
      badgeName: program.badgeName || "",
      badgeIcon: program.badgeIcon || "",
      price: program.price || 0,
      free: program.free,
    });
    setIsProgramDialogOpen(true);
  };

  const handleSaveProgram = async () => {
    try {
      if (isEditMode && editingProgram) {
        await apiClient.put(`/api/training-programs/${editingProgram._id}`, programFormData);
        toast.success("Training program updated successfully");
      } else {
        await apiClient.post("/api/training-programs", programFormData);
        toast.success("Training program created successfully");
      }
      setIsProgramDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to save training program");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "article") {
        await apiClient.delete(`/api/career-articles/${itemToDelete.id}`);
        toast.success("Article deleted successfully");
        fetchArticles();
      } else {
        await apiClient.delete(`/api/training-programs/${itemToDelete.id}`);
        toast.success("Training program deleted successfully");
        fetchPrograms();
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Career Content Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage career articles and training programs
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">
            <BookOpen className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="programs">
            <GraduationCap className="mr-2 h-4 w-4" />
            Training Programs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Career Articles</h2>
            <Button onClick={handleCreateArticle}>
              <Plus className="mr-2 h-4 w-4" />
              Create Article
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <DashboardCard title="No Articles" description="Create your first article">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No articles found. Create one to get started.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-4">
              {articles.map((article) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{article.title}</h3>
                        <Badge variant={article.published ? "default" : "secondary"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {article.category}</span>
                        <span>Author: {article.author}</span>
                        <span>Views: {article.views}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemToDelete({ type: "article", id: article._id });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Training Programs</h2>
            <Button onClick={handleCreateProgram}>
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <DashboardCard title="No Programs" description="Create your first training program">
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No training programs found. Create one to get started.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-4">
              {programs.map((program) => (
                <motion.div
                  key={program._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{program.title}</h3>
                        <Badge variant={program.published ? "default" : "secondary"}>
                          {program.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{program.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{program.duration}</span>
                        <span>{program.level}</span>
                        <span>{program.format}</span>
                        <span>{program.free ? "Free" : `$${program.price}`}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProgram(program)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemToDelete({ type: "program", id: program._id });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Dialog */}
      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Article" : "Create Article"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the article details" : "Create a new career advice article"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="article-title">Title *</Label>
              <Input
                id="article-title"
                value={articleFormData.title}
                onChange={(e) => setArticleFormData({ ...articleFormData, title: e.target.value })}
                placeholder="Article title"
              />
            </div>
            <div>
              <Label htmlFor="article-excerpt">Excerpt * (Max 500 characters)</Label>
              <Textarea
                id="article-excerpt"
                value={articleFormData.excerpt}
                onChange={(e) => setArticleFormData({ ...articleFormData, excerpt: e.target.value })}
                placeholder="Brief summary of the article"
                rows={3}
                maxLength={500}
              />
            </div>
            <div>
              <Label htmlFor="article-content">Content *</Label>
              <Textarea
                id="article-content"
                value={articleFormData.content}
                onChange={(e) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                placeholder="Full article content"
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="article-category">Category *</Label>
                <Select
                  value={articleFormData.category}
                  onValueChange={(value) => setArticleFormData({ ...articleFormData, category: value })}
                >
                  <SelectTrigger id="article-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resume Tips">Resume Tips</SelectItem>
                    <SelectItem value="Interview Tips">Interview Tips</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Career Growth">Career Growth</SelectItem>
                    <SelectItem value="Industry Insights">Industry Insights</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="article-author">Author</Label>
                <Input
                  id="article-author"
                  value={articleFormData.author}
                  onChange={(e) => setArticleFormData({ ...articleFormData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="article-published"
                checked={articleFormData.published}
                onChange={(e) => setArticleFormData({ ...articleFormData, published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="article-published">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArticleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveArticle}>
              {isEditMode ? "Update" : "Create"} Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Training Program" : "Create Training Program"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the training program details" : "Create a new skills training program"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="program-title">Title *</Label>
              <Input
                id="program-title"
                value={programFormData.title}
                onChange={(e) => setProgramFormData({ ...programFormData, title: e.target.value })}
                placeholder="Program title"
              />
            </div>
            <div>
              <Label htmlFor="program-description">Description *</Label>
              <Textarea
                id="program-description"
                value={programFormData.description}
                onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                placeholder="Program description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="program-content">Content (Optional)</Label>
              <Textarea
                id="program-content"
                value={programFormData.content}
                onChange={(e) => setProgramFormData({ ...programFormData, content: e.target.value })}
                placeholder="Detailed program content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-duration">Duration *</Label>
                <Input
                  id="program-duration"
                  value={programFormData.duration}
                  onChange={(e) => setProgramFormData({ ...programFormData, duration: e.target.value })}
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div>
                <Label htmlFor="program-level">Level *</Label>
                <Select
                  value={programFormData.level}
                  onValueChange={(value) => setProgramFormData({ ...programFormData, level: value })}
                >
                  <SelectTrigger id="program-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-format">Format *</Label>
                <Select
                  value={programFormData.format}
                  onValueChange={(value) => setProgramFormData({ ...programFormData, format: value })}
                >
                  <SelectTrigger id="program-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="program-category">Category *</Label>
                <Input
                  id="program-category"
                  value={programFormData.category}
                  onChange={(e) => setProgramFormData({ ...programFormData, category: e.target.value })}
                  placeholder="e.g., Digital Skills"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-badge-name">Badge Name (Optional)</Label>
                <Input
                  id="program-badge-name"
                  value={programFormData.badgeName}
                  onChange={(e) => setProgramFormData({ ...programFormData, badgeName: e.target.value })}
                  placeholder="e.g., Digital Skills Certified"
                />
              </div>
              <div>
                <Label htmlFor="program-badge-icon">Badge Icon URL (Optional)</Label>
                <Input
                  id="program-badge-icon"
                  value={programFormData.badgeIcon}
                  onChange={(e) => setProgramFormData({ ...programFormData, badgeIcon: e.target.value })}
                  placeholder="Icon URL"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-price">Price</Label>
                <Input
                  id="program-price"
                  type="number"
                  value={programFormData.price}
                  onChange={(e) => setProgramFormData({ ...programFormData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  disabled={programFormData.free}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="program-free"
                  checked={programFormData.free}
                  onChange={(e) => setProgramFormData({ ...programFormData, free: e.target.checked, price: 0 })}
                  className="rounded"
                />
                <Label htmlFor="program-free">Free Program</Label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="program-published"
                checked={programFormData.published}
                onChange={(e) => setProgramFormData({ ...programFormData, published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="program-published">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProgram}>
              {isEditMode ? "Update" : "Create"} Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type === "article" ? "article" : "training program"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
