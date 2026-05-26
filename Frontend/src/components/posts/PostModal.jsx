import { useEffect, useState } from "react";
import PostCard from "./PostCard";
// import CommentSection from "@/components/Common/CommentSection";/
import postApi from "@/api/post.api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PostModal = ({ post, onClose, onDelete }) => {
  const [localPost, setLocalPost] = useState(post);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postApi.deletePost(post._id);
      onDelete(post._id);
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          <div className="relative bg-zinc-100 p-4 overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2"
            >
              <X size={20} />
            </Button>
            <PostCard post={localPost} isModal />
          </div>

          {/* <div className="border-l p-4 flex flex-col">
            <CommentSection 
              post={localPost}
              setPost={setLocalPost}
            />
            
            {post.author._id === localStorage.getItem("userId") && (
              <div className="mt-auto pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            )}
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;