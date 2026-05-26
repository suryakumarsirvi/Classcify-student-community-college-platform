import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const PostDetailModal = ({ post, isOpen, onClose, suggestedPosts, onSuggestedPostClick }) => {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Post Content */}
          <div className="flex-1 min-w-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10">
                      {post.author?.personal?.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{post.author?.personal?.firstName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {post.author?.academic?.course}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                {post?.media?.resource_type === "video" ? (
                  <video
                    src={post?.media?.url}
                    className="w-full h-full object-contain"
                    controls
                  />
                ) : (
                  <img
                    src={post?.media?.url}
                    alt={post?.caption || "Post Image"}
                    className="w-full h-full object-contain"
                  />
                )}
              </CardContent>

              <CardFooter className="flex-shrink-0 flex flex-col items-start gap-4 p-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{post.caption}</p>
              </CardFooter>
            </Card>
          </div>

          {/* Suggested Posts */}
          <div className="w-80 flex-shrink-0">
            <h3 className="font-semibold mb-4">Suggested Posts</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4 pr-4">
                {suggestedPosts.map((suggestedPost) => (
                  <Card
                    key={suggestedPost._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSuggestedPostClick(suggestedPost)}
                  >
                    <CardContent className="p-0">
                      {suggestedPost?.media?.resource_type === "video" ? (
                        <video
                          src={suggestedPost?.media?.url}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <img
                          src={suggestedPost?.media?.url}
                          alt={suggestedPost?.caption || "Suggested Post"}
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </CardContent>
                    <CardFooter className="p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium line-clamp-2">
                          {suggestedPost.caption}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {suggestedPost.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal; 