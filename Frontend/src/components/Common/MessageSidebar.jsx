import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageAPI } from "@/api/message.api";
import { Button } from "@/components/ui/button";
import useAuth from "@/contexts/AuthContext";
import { MessageSquare, Plus, Users, Loader2 } from "lucide-react";
import useSocket from "@/hooks/useSocket";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import studentApi from "@/api/student.api";
import { useQuery } from "@tanstack/react-query";

const MessageSidebar = ({ onSelect }) => {
  const [viewMode, setViewMode] = useState("communities");
  const [communities, setCommunities] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showCommunityForm, setShowCommunityForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    image: null,
  });
  const { user } = useAuth();
  const socket = useSocket();

  const { data: communitiesData, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ["userCommunities", user?._id],
    queryFn: async () => {
      const response = await MessageAPI.getUserCommunities();
      const userCommunities = response?.data ? 
        (Array.isArray(response.data) ? response.data : [response.data]) : [];
      
      return userCommunities.reduce((acc, current) => {
        if (!current || !current._id) return acc;
        const exists = acc.find((item) => item._id === current._id);
        return exists ? acc : [...acc, current];
      }, []);
    },
    enabled: !!user?._id,
  });

  const { data: allUsersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["allStudentsList", user?._id],
    queryFn: async () => {
      const usersResponse = await studentApi.getAllStudents();
      if (usersResponse?.data) {
        return usersResponse.data
          .filter(u => u._id !== user._id)
          .map(u => ({
            _id: u._id,
            personal: u.personal,
            academic: u.academic
          }));
      }
      return [];
    },
    enabled: !!user?._id,
  });

  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["userConversationsList", user?._id],
    queryFn: async () => {
      const convResponse = await MessageAPI.getUserConversations();
      if (convResponse?.data) {
        return convResponse.data.map(conv => ({
          ...conv,
          participants: conv.participants.map(p => ({
            _id: p._id,
            firstName: p.personal?.firstName,
            lastName: p.personal?.lastName,
            email: p.personal?.email
          }))
        }));
      }
      return [];
    },
    enabled: !!user?._id,
  });

  useEffect(() => {
    if (communitiesData) {
      setCommunities(communitiesData);
    }
  }, [communitiesData]);

  useEffect(() => {
    if (allUsersData) {
      setAllUsers(allUsersData);
    }
  }, [allUsersData]);

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c._id === message.conversation);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.content,
            lastMessageAt: new Date().toISOString()
          };
          return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        }
        return prev;
      });
    };

    const handleNewConversation = (conversation) => {
      setConversations(prev => {
        const exists = prev.some(c => c._id === conversation._id);
        if (exists) return prev;
        
        const formattedConversation = {
          ...conversation,
          participants: conversation.participants.map(p => ({
            _id: p._id,
            firstName: p.personal?.firstName,
            lastName: p.personal?.lastName,
            email: p.personal?.email
          }))
        };
        return [...prev, formattedConversation].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('new-conversation', handleNewConversation);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('new-conversation', handleNewConversation);
    };
  }, [socket]);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newCommunity.name);
      formData.append('description', newCommunity.description);
      if (newCommunity.image) {
        formData.append('image', newCommunity.image);
      }

      const response = await MessageAPI.createCommunity(formData);
      if (response && response.community) {
        setCommunities(prev => {
          const exists = prev.some(comm => comm._id === response.community._id);
          if (exists) return prev;
          return [response.community, ...prev];
        });
        setShowCommunityForm(false);
        setNewCommunity({ name: "", description: "", image: null });
        toast.success("Community created successfully!");
      } else {
        throw new Error("Failed to create community: Invalid response format");
      }
    } catch (error) {
      toast.error(error.message || error.originalError?.response?.data?.message || "Failed to create community");
    }
  };

  const loading = isLoadingCommunities || isLoadingUsers || isLoadingConversations;

  return (
    <div className="h-full w-80 overflow-y-auto flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please log in to view messages</p>
        </div>
      ) : (
        <>
          <div className="p-4">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="communities">
                  <Users className="h-4 w-4 mr-2" /> Communities
                </TabsTrigger>
                <TabsTrigger value="direct">
                  <MessageSquare className="h-4 w-4 mr-2" /> Direct
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {viewMode === "communities" && (
            <div className="px-4 mb-2">
              <Button
                onClick={() => setShowCommunityForm(true)}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Create Community
              </Button>
            </div>
          )}

          {showCommunityForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Create New Community</h3>
                <form onSubmit={handleCreateCommunity} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Community Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          image: e.target.files[0],
                        }))}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCommunityForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Community
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === "communities"
              ? (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <div
                      key={community._id}
                      onClick={() => onSelect({ ...community, type: "community" })}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        {community.image && community.image !== ""
                          ? (
                            <img
                              src={community.image}
                              alt={community.name}
                              className="rounded-full w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = 
                                  `<span class="text-white">${(community.name && community.name[0]) ? community.name[0].toUpperCase() : '?'}</span>`;
                              }}
                            />
                          )
                          : (
                            <span className="text-white">
                              {(community.name && community.name[0]) ? community.name[0].toUpperCase() : '?'}
                            </span>
                          )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {community.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
              : (
                <div className="space-y-2">
                  {allUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => onSelect({
                        type: "direct",
                        participants: [user],
                        _id: user._id 
                      })}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary flex text-white items-center justify-center">
                        {user.personal?.firstName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {user.personal?.firstName || "Unknown"}{" "}
                          {user.personal?.lastName || ""}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user.academic?.course || "Student"}
                          {user.academic?.collegeName && ` • ${user.academic.collegeName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageSidebar;
