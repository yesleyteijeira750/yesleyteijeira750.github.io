import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    story_text: '',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const data = await base44.entities.Story.filter({ is_approved: true });
      setStories(data);
    } catch (error) {
      console.error("Error loading stories:", error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Story.create({
        ...formData,
        is_approved: user?.role === 'admin'
      });
      toast({
        title: "✅ Story Submitted!",
        description: user?.role === 'admin' 
          ? "Your story has been published." 
          : "Your story has been submitted for review."
      });
      setShowForm(false);
      setFormData({
        title: '',
        author_name: '',
        story_text: '',
        image_url: ''
      });
      if (user?.role === 'admin') loadData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to submit story.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Success Stories
          </h1>
          <p className="text-[#8B4513] text-lg">
            Stories of hope, resilience, and community impact
          </p>
        </div>

        {/* Share Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Share Your Story
          </Button>
        </div>

        {/* Stories */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" />
          </div>
        ) : stories.length > 0 ? (
          <div className="space-y-6">
            {stories.map(story => (
              <Card key={story.id} className="border-amber-200 overflow-hidden">
                <div className="md:flex">
                  {story.image_url && (
                    <div className="md:w-1/3 h-64 md:h-auto bg-gray-200">
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader className="bg-[#F5EFE6]">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-[#5C2E0F] text-2xl mb-2">
                            {story.title}
                          </CardTitle>
                          <p className="text-sm text-[#8B4513]">
                            by {story.author_name || 'Anonymous'}
                          </p>
                        </div>
                        {story.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-[#8B4513] whitespace-pre-wrap leading-relaxed">
                        {story.story_text}
                      </p>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-amber-200">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4 fill-current" />
              <h3 className="text-xl font-bold text-[#5C2E0F] mb-2">No Stories Yet</h3>
              <p className="text-[#8B4513] mb-4">Be the first to share your story!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#8B4513] hover:bg-[#5C2E0F]"
              >
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#F5EFE6] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#5C2E0F]">Share Your Story</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Story Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Input
                placeholder="Your Name (or leave blank for Anonymous)"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              />

              <Textarea
                placeholder="Share your story... How has Bountiful Blessings impacted your life?"
                value={formData.story_text}
                onChange={(e) => setFormData({ ...formData, story_text: e.target.value })}
                rows={8}
                required
              />

              <Input
                placeholder="Image URL (optional)"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-[#8B4513]">
                <p>
                  <strong>Note:</strong> {user?.role === 'admin' 
                    ? 'Your story will be published immediately.'
                    : 'Your story will be reviewed before being published. Thank you for sharing!'}
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0F]"
                >
                  Submit Story
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}