import React, { useEffect, useState } from "react";
import ChatArea from "./ChatArea";
import MessageSidebar from "./MessageSidebar";
import { Check, Loader, Loader2, Plus, Search, X, Users, MessageSquare, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/api/axios";
import studentApi from "@/api/student.api.js";
import { MessageAPI } from "@/api/message.api.js";
import useSocket from "@/hooks/useSocket";
import useAuth from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

const Messages = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    communities: []
  });
  const [searchTab, setSearchTab] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [requestSent, setRequestSent] = useState({});
  const [directMessages, setDirectMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const socket = useSocket();
  const { user } = useAuth();

  const formatMessage = (message) => {
    return {
      id: message._id,
      content: message.content,
      sender: {
        id: message.sender._id,
        name: `${message.sender.personal.firstName} ${message.sender.personal.lastName}`,
        type: message.senderType
      },
      receiver: {
        id: message.receiver,
        type: message.receiverType
      },
      timestamp: message.createdAt,
      formattedTime: message.formattedTime,
      status: message.status,
      attachments: message.attachments || []
    };
  };

  const fetchDirectMessages = async (userId) => {
    if (!userId) return;
    
    setLoadingMessages(prev => ({ ...prev, [userId]: true }));
    try {
      console.log(`📥 Fetching direct messages for user: ${userId}`);
      const response = await MessageAPI.getDirectMessages(userId);
      console.log(`📨 Direct messages response for user ${userId}:`, response.data);
      
      // Format messages before storing
      const formattedMessages = Array.isArray(response.data) 
        ? response.data.map(formatMessage)
        : [formatMessage(response.data)];
      
      setDirectMessages(prev => ({
        ...prev,
        [userId]: formattedMessages
      }));
    } catch (error) {
      console.error(`❌ Error fetching direct messages for user ${userId}:`, error);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    if (!socket) return;
  
    socket.on("new-invitation", (invitation) => {
      console.log("📩 New invitation received:", invitation);
      setInvitations((prev) => [...prev, invitation]); 
      alert(`You have been invited to join ${invitation.community.name}`);
    });

    // Listen for new direct messages
    socket.on("direct-message", (message) => {
      console.log("📨 New direct message received:", message);
      const otherUserId = message.senderId === user._id ? message.receiverId : message.senderId;
      
      setDirectMessages(prev => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), formatMessage(message)]
      }));
    });
  
    return () => {
      socket.off("new-invitation");
      socket.off("direct-message");
    };
  }, [socket, user._id]);

  const handleSearch = async (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    if (!query) {
      setSearchResults({ users: [], communities: [] });
      return;
    }

    setLoading(true);
    try {
      // Search for users
      const users = await studentApi.searchUsers(query);
      
      // Search for communities
      const communitiesResponse = await api.get(`/api/messages/communities/search?query=${query}`);
      const communities = communitiesResponse.data || [];
      
      setSearchResults({
        users: users || [],
        communities: communities || []
      });
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ users: [], communities: [] });
    }
    setLoading(false);
  };

  const handleSendInvitation = async (user) => {
    if (!selectedCommunity) {
      return console.error("No community selected to send invitation.");
    }
  
    try {
      const data = await MessageAPI.sendInvitation({
        communityId: selectedCommunity._id,
        recipientId: user._id,
      });
  
      console.log("✅ Invitation sent:", data);
  
      if (!socket) {
        console.warn("⚠️ Socket not connected, skipping emit.");
        return;
      }
  
      socket.emit("invitation-sent", { recipient: user._id });
    } catch (error) {
      console.error("❌ Failed to send invitation:", error);
    }
  };
  
  const handleJoinCommunityRequest = async (communityId) => {
    try {
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }

        // Ensure userType matches the enum values exactly
        const userType = user.role === 'admin' ? 'Admin' : 
                        user.role === 'teacher' ? 'Teacher' : 'Student';

        const response = await api.post(`/api/messages/communities/${communityId}/request`, {
            userId: user._id,
            userType: userType,
            user: {
                _id: user._id,
                name: `${user.personal?.firstName || ''} ${user.personal?.lastName || ''}`.trim(),
                type: userType
            }
        });
        
        // Show sent status for this community
        setRequestSent(prev => ({
            ...prev,
            [communityId]: true
        }));
        
        setTimeout(() => {
            setRequestSent(prev => ({
                ...prev,
                [communityId]: false
            }));
        }, 3000);
        
        // Emit socket event to notify community admin
        if (socket) {
            socket.emit("join-request-sent", { 
                communityId, 
                user: {
                    _id: user._id,
                    name: user.personal?.firstName,
                    type: userType
                }
            });
        }
        
    } catch (error) {
        console.error("Failed to send join request:", error);
        alert("Failed to send join request: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    if (!socket) return;
  
    socket.on("invitation-sent", ({ recipient }) => {
      console.log(`✅ Invitation successfully sent to: ${recipient}`);
      alert("✅ Invitation sent successfully!");
    });

    // Add socket event listener for direct messages
    socket.on("direct-message", (message) => {
      console.log("📨 New direct message received:", message);
    });
  
    return () => {
      socket.off("invitation-sent");
      socket.off("direct-message");
    };
  }, [socket]);
  
  const handleSelectUser = async (selectedUser) => {
    if (!user || !user._id) {
      return console.error("❌ User info not found, check authentication.");
    }
  
    try {
      // Format participants with proper structure
      const participants = [
        {
          participantId: user._id,
          participantType: user.role || 'Student'
        },
        {
          participantId: selectedUser._id,
          participantType: 'Student'
        }
      ];
  
      console.log("📝 Creating conversation with participants:", participants);
      const response = await MessageAPI.createConversation({ participants });
      
      // Extract conversation data
      const conversation = response.data;
      console.log("💬 New conversation created:", conversation);
      
      // Set selected chat with proper structure
      setSelectedChat({
        ...conversation,
        type: "direct",
        participants: [
          { _id: user._id, personal: user.personal },
          { _id: selectedUser._id, personal: selectedUser.personal }
        ]
      });

      // Fetch messages for this user
      await fetchDirectMessages(selectedUser._id);
  
      setIsSearchOpen(false);
    } catch (error) {
      console.error("❌ Error creating conversation:", error);
      alert("Failed to create conversation: " + (error.response?.data?.error || error.message));
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log("💬 Selected conversation:", conversation);
    setSelectedChat(conversation);
    setSelectedCommunity(
      conversation.type === "community" ? conversation : null,
    );

    // If it's a direct message conversation, fetch the messages
    if (conversation.type === "direct") {
      const otherUser = conversation.participants.find(p => p._id !== user._id);
      if (otherUser) {
        fetchDirectMessages(otherUser._id);
      }
    }
  };

  // Get filtered results based on search tab
  const getFilteredResults = () => {
    if (searchTab === "users") return searchResults.users;
    if (searchTab === "communities") return searchResults.communities;
    
    // For "all" tab, combine both results
    return [
      ...searchResults.users.map(item => ({...item, type: 'user'})),
      ...searchResults.communities.map(item => ({...item, type: 'community'}))
    ];
  };

  // Get messages for the currently selected chat
  const getCurrentMessages = () => {
    if (!selectedChat || selectedChat.type !== "direct") return [];
    
    const otherUser = selectedChat.participants.find(p => p._id !== user._id);
    if (!otherUser) return [];
    
    return directMessages[otherUser._id] || [];
  };

  // Get loading state for the currently selected chat
  const getCurrentLoadingState = () => {
    if (!selectedChat || selectedChat.type !== "direct") return false;
    
    const otherUser = selectedChat.participants.find(p => p._id !== user._id);
    if (!otherUser) return false;
    
    return loadingMessages[otherUser._id] || false;
  };

  return (
    <div className="flex h-screen relative">
      {/* Search Bar Button */}
      <div className="absolute top-1 z-50">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-5 w-5 mr-2" /> Search Users & Communities
        </Button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[40%] max-w-md">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="text-lg font-semibold">Search</h3>
              <Button 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-zinc-100 cursor-pointer" 
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-4 border rounded-md px-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full p-2 focus:outline-none"
                placeholder="Search users or communities..."
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults({ users: [], communities: [] });
                  }}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Search Tabs */}
            <Tabs value={searchTab} onValueChange={setSearchTab} className="mb-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">
                  <MessageSquare className="h-4 w-4 mr-2" /> Users
                </TabsTrigger>
                <TabsTrigger value="communities">
                  <Users className="h-4 w-4 mr-2" /> Communities
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Results */}
            <div className="max-h-60 overflow-y-auto transition-all ease-in-out duration-100">
              {loading ? (
                <div className="flex transition-all ease-in-out duration-75 items-center justify-center text-gray-500 py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Searching...</span>
                </div>
              ) : getFilteredResults().length > 0 ? (
                getFilteredResults().map((item) => {
                  if (item.type === 'community' || item.members) { // Community result
                    return (
                      <div
                        key={item._id}
                        className="p-3 flex items-center justify-between hover:bg-gray-100 rounded-md mb-1"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.members?.length || 0} members
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinCommunityRequest(item._id)}
                          size="sm"
                          className={requestSent[item._id] ? "bg-green-500" : ""}
                          disabled={requestSent[item._id]}
                        >
                          {requestSent[item._id] ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <SendHorizontal className="h-4 w-4 mr-1" />
                          )}
                          {requestSent[item._id] ? "Sent" : "Join"}
                        </Button>
                      </div>
                    );
                  } else { // User result
                    return (
                      <div
                        key={item._id}
                        className="p-3 flex items-center justify-between hover:bg-gray-100 rounded-md mb-1 cursor-pointer"
                        onClick={() => handleSelectUser(item)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {item.personal?.firstName?.[0] || "?"}
                          </div>
                          <div>
                            <div className="font-medium">
                              {item.personal?.firstName} {item.personal?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.academic?.course || "Student"}
                              {item.academic?.collegeName && ` • ${item.academic.collegeName}`}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    );
                  }
                })
              ) : searchQuery ? (
                <p className="text-center text-gray-500 py-8">No results found</p>
              ) : (
                <p className="text-center text-gray-500 py-8">Type to search</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat and Sidebar */}
      <ChatArea
        selectedCommunity={selectedCommunity}
        selectedConversation={selectedChat}
        setIsSearchOpen={setIsSearchOpen}
        messages={getCurrentMessages()}
        loadingMessages={getCurrentLoadingState()}
        currentUser={user}
      />
      <MessageSidebar
        onSelect={handleSelectConversation}
        onCommunitySelect={setSelectedCommunity}
      />
    </div>
  );
};

export default Messages;
