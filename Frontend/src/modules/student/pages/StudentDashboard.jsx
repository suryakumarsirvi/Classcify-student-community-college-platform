import { useEffect, useState } from "react";
import CreateButton from "@/components/Common/CreateButton";
import api from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "@/components/posts/PostCard";
import UserCard from "@/components/Common/UserCard";
import PostModal from "@/components/posts/PostModal";
import studentService from "@/modules/student/services/student.service";

const StudentDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/api/posts?page=${page}`);
      setPosts((prev) => {
        const uniquePosts = [...prev, ...data].reduce((acc, post) => {
          acc.set(post._id, post);
          return acc;
        }, new Map());
        return Array.from(uniquePosts.values());
      });
      setHasMore(data.length === 10);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentService.getAllStudents();
      const shuffled = data.sort(() => 0.5 - Math.random());
      setStudents(shuffled.slice(0, 6));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStudents();
  }, []);

  return (
    <div className="flex gap-8">
      <div className="max-w-xl mx-auto ml-48">
        <div className="flex gap-8">
          <div className="flex-1">
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchPosts}
              hasMore={hasMore}
              loader={<Skeleton className="h-64 w-full" />}
            >
              <h1 className="text-2xl font-bold text-zinc-700 mb-5">Home Feed</h1>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
        <CreateButton />
      </div>

      <div className="w-80 h-screen fixed right-0">
        <div className="p-4">
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-zinc-700">Suggested Students</h1>
            {students.length > 0
              ? students.map((student) => <UserCard key={student._id} user={student} />)
              : Array(6).fill().map((_, index) => (
                  <Skeleton key={`skeleton-${index}`} className="h-12 w-full" />
                ))}
          </div>
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
