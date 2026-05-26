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

const MessageSidebar = ({ onSelect }) => {
  const [viewMode, setViewMode] = useState("communities");
  const [communities, setCommunities] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showCommunityForm, setShowCommunityForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    image: null,
  });
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!user || !user._id) {
          console.log('User not authenticated, skipping data load');
          return;
        }

        // Get user's communities
        const response = await MessageAPI.getUserCommunities();
        
        // Filter communities where user is the creator
        const userCommunities = response?.data ? 
          (Array.isArray(response.data) ? response.data : [response.data]) : [];
        
        const filteredCommunities = userCommunities.filter(community => {
          if (!community || !community._id) return false;
          
          // Only show communities where user is the creator
          return community.creator?._id === user._id;
        });

        // Deduplicate just in case
        const uniqueCommunities = filteredCommunities.reduce((acc, current) => {
          if (!current || !current._id) return acc;
          const exists = acc.find((item) => item._id === current._id);
          return exists ? acc : [...acc, current];
        }, []);

        console.log('Loaded user communities:', uniqueCommunities);
        setCommunities(uniqueCommunities);

        // Load all users
        const usersResponse = await studentApi.getAllStudents();
        if (usersResponse?.data) {
          // Filter out current user and format the data
          const formattedUsers = usersResponse.data
            .filter(u => u._id !== user._id)
            .map(u => ({
              _id: u._id,
              personal: u.personal,
              academic: u.academic
            }));
          setAllUsers(formattedUsers);
        }

        // Also load direct conversations
        const convResponse = await MessageAPI.getUserConversations();
        if (convResponse?.data) {
          const formattedConversations = convResponse.data.map(conv => ({
            ...conv,
            participants: conv.participants.map(p => ({
              _id: p._id,
              firstName: p.personal?.firstName,
              lastName: p.personal?.lastName,
              email: p.personal?.email
            }))
          }));
          setConversations(formattedConversations);
        }
      } catch (error) {
        console.error('Error loading sidebar data:', error);
        setCommunities([]);
        setConversations([]);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Add socket listener for real-time conversation updates
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
          // Sort to bring updated conversation to the top
          return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        }

        // If conversation doesn't exist, fetch it (needs API endpoint)
        // For now, we might rely on the 'new-conversation' event
        // const fetchNewConversation = async () => { ... }
        // fetchNewConversation();

        return prev;
      });
    };

    const handleNewConversation = (conversation) => {
      setConversations(prev => {
        const exists = prev.some(c => c._id === conversation._id);
        if (exists) return prev; // Avoid duplicates
        // Format incoming conversation
        const formattedConversation = {
          ...conversation,
           participants: conversation.participants.map(p => ({
            _id: p._id,
            firstName: p.personal?.firstName,
            lastName: p.personal?.lastName,
            email: p.personal?.email
          }))
        };
        // Add and sort
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
      // Create FormData object
      const formData = new FormData();
      
      // Add required fields
      formData.append('name', newCommunity.name);
      formData.append('description', newCommunity.description);
      
      // Add image if exists
      if (newCommunity.image) {
        formData.append('image', newCommunity.image);
      }

      console.log("Creating community with data:", {
        name: newCommunity.name,
        description: newCommunity.description,
        image: newCommunity.image ? 'File exists' : 'No image'
      });

      const response = await MessageAPI.createCommunity(formData);
      
      // Check if response has the expected format
      if (response && response.community) {
        // Add the new community to the list immediately
        setCommunities(prev => {
          // Check if community already exists
          const exists = prev.some(comm => comm._id === response.community._id);
          if (exists) return prev;
          
          // Add new community to the beginning of the list
          return [response.community, ...prev];
        }); 
        
        // Reset form
        setShowCommunityForm(false);
        setNewCommunity({ name: "", description: "", image: null });
        
        // Show success message
        toast.success("Community created successfully!");
      } else {
        throw new Error("Failed to create community: Invalid response format");
      }
    } catch (error) {
      console.error("Failed to create community:", error);
      // Show error message
      toast.error(error.response?.data?.error || error.message || "Failed to create community");
    }
  };

  const handleSendInvitation = async (user) => {
    if (!selectedCommunity) {
        console.error("No community selected to send invitation.");
        return;
    }

    try {
        const data = await MessageAPI.sendInvitation({
            communityId: selectedCommunity._id,
            userId: user._id,
            senderType: user.role || 'Student',
            senderName: `${user.personal?.firstName || ''} ${user.personal?.lastName || ''}`
        });

        console.log("✅ Invitation sent:", data);

        if (!socket) {
            console.warn("⚠️ Socket not connected, skipping emit.");
            return;
        }

        socket.emit("invitation-sent", { recipient: user._id });
        alert("Invitation sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send invitation:", error);
        alert("Failed to send invitation: " + (error.response?.data?.message || error.message));
    }
  };

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
                                console.error("Failed to load image:", community.image);
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
                  {/* Show all users */}
                  {allUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => onSelect({
                        type: "direct",
                        participants: [user],
                        _id: user._id // Use user ID as conversation ID for new chats
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
