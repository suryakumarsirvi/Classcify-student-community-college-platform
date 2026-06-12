
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";
import { Plus, Send, Check, Search, X, Users } from "lucide-react";
import chatIcon from "@/assets/images/chats-new.svg";
import ChatInput from "../ui/ChatInput";
import useAuth from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import studentApi from "@/api/student.api";
import { MessageAPI } from "@/api/message.api";

export const ChatArea = ({
  selectedConversation,
  messages
}) => {
  // Initialize local message state from props
  const [localMessages, setLocalMessages] = useState(messages || []);
  // Sync when parent messages prop changes
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInvitationSent, setIsInvitationSent] = useState(false);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [isMembersListOpen, setIsMembersListOpen] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const fetchCommunityDetails = async () => {
    if (selectedConversation?.type === "community") {
      try {
        const response = await MessageAPI.getCommunityDetails(selectedConversation._id);
        if (response?.data) {
          setCommunityDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching community details:", error);
      }
    } else {
      setCommunityDetails(null);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    console.log("🧠 Debug Info:");
    console.log("newMessage:", newMessage);
    console.log("selectedConversation:", selectedConversation);
    console.log("selectedConversation._id:", selectedConversation?._id);
    console.log("user:", user);
    console.log("user._id:", user?._id);

    if (!newMessage.trim()) {
      console.error("Message content is empty.");
      return;
    }

    if (!user || !user._id) {
      console.error("User data is missing. Cannot send message.");
      return;
    }

    if (!selectedConversation || !selectedConversation._id) {
      console.error("Selected conversation is missing.");
      return;
    }

    
    if (selectedConversation.type === "direct") {
      const otherParticipant = selectedConversation?.participants?.find(
        (p) => p._id !== user._id
      );

      if (!otherParticipant?._id) {
        console.error("No valid recipient found for direct message.");
        return;
      }

      try {
        const messageData = {
          content: newMessage,
          receiverId: otherParticipant._id,
        };

        const response = await MessageAPI.sendDirectMessage(messageData);
        if (response?.data) {
          setLocalMessages((prev) => [...prev, response.data]);
          setNewMessage("");
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error sending direct message:", error);
      }
    } else if (selectedConversation.type === "community") {
      try {
        
        const messageData = {
          content: newMessage,
          sender: user._id,
          senderType: user.role && user.role !== 'admin' ? user.role : "Student",
          senderName: user.name || `${user.personal?.firstName} ${user.personal?.lastName}`,
          isAdmin: selectedConversation.admins?.some(admin => admin._id === user._id) || 
                  selectedConversation.creator?._id === user._id
        };

        console.log("Sending community message with data:", messageData);

        const response = await MessageAPI.sendCommunityMessage(
          selectedConversation._id,
          messageData
        );

        console.log("Community message response:", response);

        if (response?.data) {
          setLocalMessages((prev) => [...prev, response.data]);
          setNewMessage("");
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error sending community message:", error);
        
      }
    } else {
      console.error("Unknown conversation type:", selectedConversation.type);
    }
  };

  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleNewMessage = (message) => {
      let isForCurrentChat = false;
      if (selectedConversation.type === "direct") {
        const otherUserId = selectedConversation.participants?.find(p => p._id !== user._id)?._id || selectedConversation._id;
        const msgSenderId = message.sender?._id || message.sender;
        const msgReceiverId = message.receiver?._id || message.receiver;
        
        isForCurrentChat = (msgSenderId === user._id && msgReceiverId === otherUserId) ||
                           (msgSenderId === otherUserId && msgReceiverId === user._id);
      } else if (selectedConversation.type === "community") {
        isForCurrentChat = message.conversation === selectedConversation._id || message.community === selectedConversation._id;
      }

      if (isForCurrentChat) {
        setLocalMessages((prev) => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedConversation, user?._id]);

  useEffect(() => {
    if (!socket || !selectedConversation || selectedConversation.type !== "community") return;

    const communityId = selectedConversation._id;
    console.log(`🔌 Joining community room: ${communityId}`);
    socket.emit("joinCommunity", communityId);

    return () => {
      console.log(`🔌 Leaving community room: ${communityId}`);
      socket.emit("leaveCommunity", communityId);
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation?._id) return;
      try {
        let response;
        if (selectedConversation.type === "direct") {
          const otherUserId = selectedConversation.participants?.find(p => p._id !== user._id)?._id || selectedConversation._id;
          response = await MessageAPI.getDirectMessages(otherUserId);
        } else {
          response = await MessageAPI.getConversationMessages(selectedConversation._id);
        }

        if (response?.data) {
          const rawMessages = Array.isArray(response.data) ? response.data : [response.data];
          setLocalMessages(rawMessages);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [selectedConversation, user?._id]);

  const handleSearch = async (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await studentApi.searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setIsSearching(false);
  };

  const handleSendInvitation = async (invitee) => {
    if (!selectedConversation) return;

    // Use the current authenticated user as the sender
    const sender = user; // from useAuth()

    try {
        await MessageAPI.sendInvitation({
            communityId: selectedConversation._id,
            userId: invitee._id,
            // Use a valid enum value for senderType
            senderType: "Student",
            senderName: `${sender.personal?.firstName || ''} ${sender.personal?.lastName || ''}`.trim()
        });

        setIsInvitationSent(true);
        setTimeout(() => {
            setIsInvitationSent(false);
            setIsSearchOpen(false);
        }, 2000);
    } catch (error) {
        console.error("Failed to send invitation:", error);
        alert("Failed to send invitation: " + (error.message || error.originalError?.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex-1 mt-12 h-[90%] flex flex-col border rounded-lg overflow-hidden">
      {}
      {!selectedConversation
        ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <img src={chatIcon} className="h-34 w-34" alt="Chat Icon" />
          </div>
        )
        : (
          <>
            {}
            <div className="border-b p-2 bg-background flex items-center justify-between">
              <div className="flex items-center gap-3">
                {}
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  {selectedConversation?.type === "community"
                    ? selectedConversation.image
                      ? (
                        <img
                          src={selectedConversation.image}
                          alt={selectedConversation.name}
                          className="rounded-full w-full h-full object-cover"
                        />
                      )
                      : (
                        <span className="text-white text-lg">
                          {selectedConversation.name[0].toUpperCase()}
                        </span>
                      )
                    : (
                      <span className="text-white text-lg">
  {selectedConversation?.participants?.[0]?.personal?.firstName?.[0]?.toUpperCase() || 'U'}
</span>

                    )}
                </div>

                {}
                <div>
                  <h4 className="font-semibold text-sm">
                    {selectedConversation?.type === "community"
                      ? selectedConversation.name
                      : `${
                        selectedConversation?.participants?.[0]?.personal
                          ?.firstName || "Unknown"
                      } 
       ${selectedConversation?.participants?.[0]?.personal?.lastName || ""}`}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation?.type === "community"
                      ? `${selectedConversation?.members.length} members`
                      : "Last seen recently"}
                    {" "}
                  </p>
                </div>
              </div>

              {}
              {selectedConversation?.type === "community" && (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setIsMembersListOpen(true)}
                    variant="ghost"
                    className="hover:bg-zinc-100 cursor-pointer h-8 w-8 rounded-full flex items-center justify-center"
                    title="View Members"
                  >
                    <Users className="h-4 w-4 text-zinc-600" />
                  </Button>
                  <Button
                    onClick={() => setIsSearchOpen(true)}
                    variant="ghost"
                    className="hover:bg-zinc-100 cursor-pointer h-8 w-8 rounded-full flex items-center justify-center"
                    title="Add Members"
                  >
                    {isInvitationSent ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {}
            {isSearchOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg w-96 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">Add Members</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsSearchOpen(false)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="flex-1"
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      searchResults.map((searchUser) => {
                        const isAlreadyMember = communityDetails?.members?.some(m => m._id === searchUser._id) || 
                                                selectedConversation?.members?.some(m => (m._id === searchUser._id || m === searchUser._id));
                        return (
                          <div
                            key={searchUser._id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                                {searchUser.personal?.firstName?.[0] || "?"}
                              </div>
                              <span>
                                {searchUser.personal?.firstName} {searchUser.personal?.lastName}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSendInvitation(searchUser)}
                              disabled={isAlreadyMember || isInvitationSent}
                              className={isAlreadyMember ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-100 cursor-not-allowed" : ""}
                            >
                              {isAlreadyMember ? "Added" : "Add"}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View Members List Modal */}
            {isMembersListOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-lg w-96 shadow-xl max-w-md">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Community Members</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMembersListOpen(false)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                    {/* Display creator first */}
                    {communityDetails?.creator && (
                      <div className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {communityDetails.creator.personal?.firstName?.[0]?.toUpperCase() || 
                             communityDetails.creator.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">
                              {communityDetails.creator.personal?.firstName ? 
                                `${communityDetails.creator.personal.firstName} ${communityDetails.creator.personal.lastName}` : 
                                communityDetails.creator.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-indigo-600 font-medium">Creator</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display other members */}
                    {communityDetails?.members?.filter(m => m._id !== communityDetails.creator?._id).map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 font-semibold text-sm">
                            {member.personal?.firstName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">
                              {member.personal?.firstName} {member.personal?.lastName}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {member.academic?.course || "Student"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!communityDetails?.members || communityDetails.members.length === 0) && (
                      <p className="text-center text-sm text-zinc-500 py-4">No members found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50">
              {Array.isArray(localMessages) &&
                localMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      key={message._id}
                      className={`flex items-end gap-2 ${
                        message.sender._id === user._id
                          ? "justify-end flex-row-reverse"
                          : "justify-start"
                      }`}
                    >
                      {/* Sender Profile Pic (Small) */}
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 text-xs text-gray-700 font-semibold uppercase">
                        {message.sender?.personal?.firstName?.[0] || '?'}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === user._id
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {}
            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
            />
          </>
        )}
    </div>
  );
};

export default ChatArea;
