import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import postApi from "@/api/post.api";
import studentApi from "@/api/student.api";
import UserCard from "@/components/Common/UserCard";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import PostDetailModal from "./PostDetailModal";
import UserProfileModal from "./UserProfileModal";
import axios from "axios";

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMoreUsers, setShowMoreUsers] = useState(false);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setIsLoading(true);
          
          // Get the appropriate token
          const token = localStorage.getItem('adminToken') || 
                       localStorage.getItem('teacherToken') || 
                       localStorage.getItem('studentToken');

          // Make direct axios calls with token
          const [usersRes, postsRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/students/search?q=${searchQuery}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get(`http://localhost:5000/api/posts/search?q=${searchQuery}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);

          setUserResults(usersRes.data);
          setPostResults(postsRes.data);
        } catch (error) {
          console.error("Search error:", error.response?.data || error.message);
          setUserResults([]);
          setPostResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserResults([]);
        setPostResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Get the appropriate token based on user role
        const token = localStorage.getItem('adminToken') || 
                     localStorage.getItem('teacherToken') || 
                     localStorage.getItem('studentToken');
                     
        const response = await axios.get('http://localhost:5000/api/posts/explore', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setAllPosts(response.data);
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };
    loadPosts();
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    // Get suggested posts based on tags
    const suggested = postResults
      .filter(p => 
        p._id !== post._id && // Don't include the selected post
        p.tags.some(tag => post.tags.includes(tag)) // Has at least one matching tag
      )
      .sort((a, b) => {
        // Sort by number of matching tags
        const aMatches = a.tags.filter(tag => post.tags.includes(tag)).length;
        const bMatches = b.tags.filter(tag => post.tags.includes(tag)).length;
        return bMatches - aMatches;
      })
      .slice(0, 6); // Get top 6 suggestions
    setSuggestedPosts(suggested);
  };

  const handleUserClick = async (user) => {
    try {
      setSelectedUser(user);
      const posts = await postApi.getUserPosts(user._id);
      if (Array.isArray(posts)) {
        setUserPosts(posts);
      } else {
        console.error('Received invalid posts data:', posts);
        setUserPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    }
  };

  const PostCard = ({ post, onClick }) => (
    <div className="break-inside-avoid mb-4">
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative w-full"
        onClick={() => onClick(post)}
      >
        <div className="relative w-full">
          {post?.media?.resource_type === "video" ? (
            <video
              src={post?.media?.url}
              className="w-full"
              controls
            />
          ) : (
            <img
              src={post?.media?.url}
              alt={post?.caption || "Post Image"}
              className="w-full"
              loading="lazy"
            />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 p-4 flex flex-col justify-between">
            {/* Author info */}
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-white">
                  {post.author?.personal?.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-medium text-white">
                  {post.author?.personal?.firstName}
                </p>
                <p className="text-xs text-white/80">
                  {post.author?.academic?.course}
                </p>
              </div>
            </div>

            {/* Caption and tags */}
            <div className="space-y-2">
              {post.caption && (
                <p className="text-sm text-white line-clamp-2">
                  {post.caption}
                </p>
              )}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full" />
            ))}
          </div>
        </div>
      );
    }

    if (!searchQuery.trim()) {
      return null;
    }

    const displayedUsers = showMoreUsers ? userResults : userResults.slice(0, 5);
    const hasMoreUsers = userResults.length > 5;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Users Section */}
        {userResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Found {userResults.length} {userResults.length === 1 ? 'student' : 'students'}
              </h2>
              {hasMoreUsers && !showMoreUsers && (
                <Button
                  variant="outline"
                  onClick={() => setShowMoreUsers(true)}
                  className="text-sm"
                >
                  View More Students
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedUsers.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => handleUserClick(user)}
                  className="transform hover:scale-[1.02] transition-transform"
                >
                  <UserCard user={user} variant="explore" className="cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {postResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Found {postResults.length} {postResults.length === 1 ? 'post' : 'posts'}
            </h2>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance] space-y-3">
              {postResults.map((post) => (
                <PostCard key={post._id} post={post} onClick={handlePostClick} />
              ))}
            </div>
          </div>
        )}

        {!userResults.length && !postResults.length && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-4 text-center border-b">
        <h1 className="text-2xl font-semibold mb-5">Explore</h1>
        <div className="max-w-3xl mx-auto">
          <Input
            placeholder="Search students and posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        {searchQuery ? (
          renderSearchResults()
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 p-4 mx-auto max-w-[2000px] [column-fill:_balance] space-y-3">
            {allPosts.map((post) => (
              <PostCard key={post._id} post={post} onClick={handlePostClick} />
            ))}
          </div>
        )}
      </ScrollArea>

      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        suggestedPosts={suggestedPosts}
        onSuggestedPostClick={handlePostClick}
      />

      <UserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        userPosts={userPosts}
      />
    </div>
  );
};

export default ExplorePage;
