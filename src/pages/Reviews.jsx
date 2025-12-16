import React, { useState, useEffect } from "react";
import { Review } from "@/entities/Review";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trash2, PauseCircle, PlayCircle, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [areReviewsPaused, setAreReviewsPaused] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordAction, setPasswordAction] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    author_name: "",
    rating: 5,
    comment: ""
  });

  useEffect(() => {
    loadData();
    // Check if user has already submitted a review (for non-logged-in users)
    const submitted = localStorage.getItem('hasSubmittedReview');
    if (submitted === 'true') {
      setHasSubmittedReview(true);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const data = await Review.list("-created_date");
      setReviews(data);
      
      // Find current user's review
      const userReview = data.find(r => r.created_by === currentUser.email);
      setMyReview(userReview);
      
      if (userReview) {
        setFormData({
          author_name: userReview.author_name,
          rating: userReview.rating,
          comment: userReview.comment
        });
      } else {
        setFormData({
          author_name: currentUser.full_name || "",
          rating: 5,
          comment: ""
        });
      }
      
      const pausedReview = data.find(r => r.is_approved === false);
      setAreReviewsPaused(!!pausedReview);
    } catch (error) {
      // User not logged in
      setUser(null);
      const data = await Review.list("-created_date");
      setReviews(data);
      
      const pausedReview = data.find(r => r.is_approved === false);
      setAreReviewsPaused(!!pausedReview);
      
      setFormData({
        author_name: "",
        rating: 5,
        comment: ""
      });
    }
    
    setIsLoading(false);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (areReviewsPaused) {
      toast({
        title: "Reviews are paused",
        description: "The administrator has temporarily paused new reviews.",
        variant: "destructive",
      });
      return;
    }

    // Check if non-logged-in user has already submitted
    if (!user && hasSubmittedReview) {
      toast({
        title: "Review already submitted",
        description: "You have already submitted a review. Thank you for your feedback!",
        variant: "destructive",
      });
      return;
    }

    if (myReview && user) {
      // Update existing review (only for logged-in users)
      await Review.update(myReview.id, formData);
      setIsEditingMyReview(false);
      toast({
        title: "✅ Review updated!",
        description: "Your review has been updated successfully.",
      });
    } else {
      // Create new review
      await Review.create(formData);
      
      // Mark that user has submitted a review
      if (!user) {
        localStorage.setItem('hasSubmittedReview', 'true');
        setHasSubmittedReview(true);
      }
      
      setFormData({ author_name: "", rating: 5, comment: "" });
      toast({
        title: "✅ Review submitted!",
        description: "Thank you for your feedback.",
      });
    }
    
    loadData();
  };

  const handlePauseToggle = () => {
    setPasswordAction("pause");
    setShowPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    setPasswordAction("delete");
    setShowPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== "123456789Q") {
      setPasswordError("Incorrect password. Access denied.");
      setPassword("");
      return;
    }

    setShowPasswordDialog(false);
    setPasswordError("");

    if (passwordAction === "pause") {
      const newPausedState = !areReviewsPaused;
      setAreReviewsPaused(newPausedState);
      
      toast({
        title: newPausedState ? "⏸️ Reviews paused" : "▶️ Reviews resumed",
        description: newPausedState 
          ? "Users cannot submit new reviews" 
          : "Users can now submit reviews",
      });
    } else if (passwordAction === "delete" && selectedReview) {
      await Review.delete(selectedReview.id);
      loadData();
      toast({
        title: "🗑️ Review deleted",
        description: "The review has been removed.",
      });
      setSelectedReview(null);
    }

    setPassword("");
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= rating 
                ? "fill-amber-400 text-amber-400" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = calculateAverageRating();
  const isAdmin = user?.role === "admin";
  const canSubmitReview = !areReviewsPaused && (!hasSubmittedReview || user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#5C2E0F] mb-4">
            Community Reviews
          </h1>
          <p className="text-lg text-[#8B4513]">
            Share your experience with Bountiful Blessings
          </p>

          {/* Average Rating Display */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 inline-block border-2 border-amber-200">
            <div className="text-6xl font-bold text-[#8B4513] mb-2">
              {averageRating}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
            <p className="text-sm text-[#8B4513]">
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Admin Controls - Only visible to admins */}
          {isAdmin && (
            <div className="mt-6">
              <Button
                onClick={handlePauseToggle}
                variant="outline"
                className="border-amber-300 hover:bg-amber-100"
              >
                {areReviewsPaused ? (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume Reviews
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Pause Reviews
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Review Form */}
        {canSubmitReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-12 border-2 border-amber-200 shadow-xl">
              <CardHeader className="bg-[#F5EFE6]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl text-[#5C2E0F]">
                    {myReview && !isEditingMyReview ? "Your Review" : myReview ? "Edit Your Review" : "Leave a Review"}
                  </CardTitle>
                  {myReview && !isEditingMyReview && user && (
                    <Button
                      onClick={() => setIsEditingMyReview(true)}
                      variant="outline"
                      size="sm"
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {myReview && !isEditingMyReview && user ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#8B4513] mb-1">Your Rating</p>
                      {renderStars(myReview.rating)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#8B4513] mb-1">Your Comment</p>
                      <p className="text-[#5C2E0F] whitespace-pre-wrap">{myReview.comment}</p>
                    </div>
                    <p className="text-xs text-[#8B4513]/70">
                      Posted on {new Date(myReview.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#8B4513] mb-2">
                        Your Name *
                      </label>
                      <Input
                        value={formData.author_name}
                        onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                        placeholder="Enter your name"
                        required
                        className="border-amber-300 focus:border-[#8B4513]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8B4513] mb-2">
                        Rating *
                      </label>
                      {renderStars(formData.rating, true, (rating) => setFormData({...formData, rating}))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8B4513] mb-2">
                        Your Review *
                      </label>
                      <Textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        placeholder="Share your experience with us..."
                        rows={4}
                        required
                        className="border-amber-300 focus:border-[#8B4513] resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      {myReview && isEditingMyReview && user && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingMyReview(false);
                            setFormData({
                              author_name: myReview.author_name,
                              rating: myReview.rating,
                              comment: myReview.comment
                            });
                          }}
                          className="flex-1 border-amber-300 hover:bg-amber-100"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D] text-white"
                      >
                        {myReview && user ? "Update Review" : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!canSubmitReview && !areReviewsPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-100 border-2 border-amber-300 rounded-xl p-6 mb-12 text-center"
          >
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-[#5C2E0F]">
              Thank you for your review!
            </p>
            <p className="text-sm text-[#8B4513] mt-2">
              You have already submitted a review. We appreciate your feedback!
            </p>
          </motion.div>
        )}

        {areReviewsPaused && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-100 border-2 border-amber-300 rounded-xl p-6 mb-12 text-center"
          >
            <PauseCircle className="w-12 h-12 text-[#8B4513] mx-auto mb-3" />
            <p className="text-lg font-medium text-[#5C2E0F]">
              Reviews are temporarily paused
            </p>
            <p className="text-sm text-[#8B4513] mt-2">
              New review submissions are currently disabled
            </p>
          </motion.div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#5C2E0F] mb-6">
            All Reviews ({reviews.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]" />
            </div>
          ) : reviews.length > 0 ? (
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-amber-200 shadow-md hover:shadow-lg transition-shadow relative group">
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(review)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#5C2E0F]">
                            {review.author_name}
                          </h3>
                          <p className="text-sm text-[#8B4513]">
                            {new Date(review.created_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-[#8B4513] leading-relaxed whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Card className="border-amber-200 p-12 text-center">
              <Star className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#5C2E0F] mb-2">
                No reviews yet
              </h3>
              <p className="text-[#8B4513]">
                Be the first to share your experience!
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md bg-[#F5EFE6]">
          <DialogHeader>
            <DialogTitle className="text-[#5C2E0F]">
              🔐 Administrator Access Required
            </DialogTitle>
            <DialogDescription className="text-[#8B4513]">
              Enter the administrator password to continue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`border-amber-300 focus:border-[#8B4513] bg-white ${
                  passwordError ? "border-red-500" : ""
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600 font-medium">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordError("");
                  setPassword("");
                }}
                className="flex-1 border-[#8B4513] text-[#8B4513] hover:bg-amber-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#5C2E0F] hover:to-[#A0522D]"
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#F5EFE6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C2E0F]">
              Delete this review?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B4513]">
              This action cannot be undone. The review will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#8B4513] text-[#8B4513] hover:bg-amber-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}