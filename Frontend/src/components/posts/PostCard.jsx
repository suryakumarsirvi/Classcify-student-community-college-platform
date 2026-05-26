import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TimeAgo from "timeago-react";
import postApi from "@/api/post.api";
import { Input } from "../ui/input";

const PostCard = ({ post }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localPost, setLocalPost] = useState(post);
  const [openPost, setOpenPost] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && post.media.resource_type === "video") {
          videoRef.current?.play();
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const handleLike = async () => {
    try {
      const updatedPost = await postApi.likePost(localPost._id);
      setLocalPost(updatedPost);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const updatedPost = await postApi.addComment(localPost._id, commentText);
      setLocalPost(updatedPost);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="bg-white relative dark:bg-zinc-800 rounded-xl shadow-sm border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
          <span className="font-medium">
            {post.author?.personal?.firstName[0]}
          </span>
        </div>
        <div>
          <h4 className="font-semibold">
            {post.author?.personal?.firstName} {post.author?.personal?.lastName}
          </h4>
          <p className="text-sm text-zinc-500">
            {post.author?.academic?.course} •{" "}
            <TimeAgo datetime={post.createdAt} />
          </p>
        </div>
      </div>

      {post.media.resource_type === "video"
        ? (
          <div
            className="relative cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <video
              ref={videoRef}
              src={post.media.url}
              className="w-full rounded-lg"
              muted={isMuted}
              loop
              playsInline
              onClick={() => setOpenPost(true)}
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full p-2 h-8 w-8"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
            </div>
          </div>
        )
        : (
          <img
            src={post.media.url}
            alt={post.caption}
            className="w-full rounded-lg cursor-pointer"
            onClick={() => setOpenPost(true)}
          />
        )}
      {post.caption && (
        <p className="text-sm my-3">
          {post.caption.charAt(0).toUpperCase() + post.caption.slice(1)}
        </p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 my-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-sm text-blue-500">#{tag}</span>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={handleLike}
          >
            <Heart
              size={28} // Increased size from 24 to 28
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-red-500" : "text-zinc-500"}
            />
            <span className="ml-1">{localPost.likes?.length || 0}</span>
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="p-2 text-zinc-500">
            <Bookmark size={26} /> {/* Increased size from 20 to 26 */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
