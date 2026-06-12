import React, { useEffect, useState } from "react";
import { Bell, Check, X, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageAPI } from "@/api/message.api";
import useSocket from "@/hooks/useSocket";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/contexts/AuthContext";
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Notification = () => {
  const [notifications, setNotifications] = useState({
    invitations: [],
    joinRequests: []
  });
  const [activeTab, setActiveTab] = useState("invitations");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  const loadNotifications = async () => {
    try {
      
      const { data: invitations } = await MessageAPI.getInvitations();
      console.log("Direct Message Invitations:", invitations);
      
      
      try {
        const { data: joinRequests } = await api.get('/api/messages/communities/join-requests');
        console.log("Join Requests Data:", joinRequests);
        setNotifications({
          invitations: invitations || [],
          joinRequests: Array.isArray(joinRequests) ? joinRequests : []
        });
      } catch (joinRequestError) {
        console.error("Error loading join requests:", joinRequestError);
        
        setNotifications({
          invitations: invitations || [],
          joinRequests: []
        });
        
        toast.error("Failed to load join requests. Please try again later.");
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      
      toast.error("Failed to load notifications. Please try again later.");
      setNotifications({
        invitations: [],
        joinRequests: []
      });
    }
  };

  useEffect(() => {
    loadNotifications();

    if (!socket) return;

    
    const handleNewInvitation = (invitation) => {
      setNotifications(prev => ({
        ...prev,
        invitations: [...prev.invitations, invitation]
      }));
    };

    
    const handleJoinRequest = (request) => {
      setNotifications(prev => ({
        ...prev,
        joinRequests: [...prev.joinRequests, request]
      }));
    };

    socket.on("new-invitation", handleNewInvitation);
    socket.on("join-request-received", handleJoinRequest);

    return () => {
      socket.off("new-invitation", handleNewInvitation);
      socket.off("join-request-received", handleJoinRequest);
    };
  }, [socket]);

  const handleAcceptInvitation = async (notification) => {
    try {
      await MessageAPI.acceptInvitation(notification._id);
      setNotifications(prev => ({
        ...prev,
        invitations: prev.invitations.filter(n => n._id !== notification._id)
      }));
      setShowDialog(false);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      alert("Failed to accept invitation");
    }
  };

  const handleRejectInvitation = async (notification) => {
    try {
      await MessageAPI.rejectInvitation(notification._id);
      setNotifications(prev => ({
        ...prev,
        invitations: prev.invitations.filter(n => n._id !== notification._id)
      }));
      setShowDialog(false);
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      alert("Failed to reject invitation");
    }
  };

  const handleAcceptJoinRequest = async (request) => {
    try {
      await api.post(`/api/messages/communities/${request.community._id}/request/${request.user._id}/accept`);
      setNotifications(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(r => 
          !(r.community._id === request.community._id && r.user._id === request.user._id)
        )
      }));
      setShowDialog(false);
    } catch (error) {
      console.error("Error accepting join request:", error);
      alert("Failed to accept join request");
    }
  };

  const handleRejectJoinRequest = async (request) => {
    try {
      await api.post(`/api/messages/communities/${request.community._id}/request/${request.user._id}/reject`);
      setNotifications(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(r => 
          !(r.community._id === request.community._id && r.user._id === request.user._id)
        )
      }));
      setShowDialog(false);
    } catch (error) {
      console.error("Error rejecting join request:", error);
      alert("Failed to reject join request");
    }
  };

  
  const totalNotifications = notifications.invitations.length + notifications.joinRequests.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col flex-1 min-h-[500px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Notifications Hub</h2>
              <p className="text-sm text-zinc-500">Manage your community invitations and join requests</p>
            </div>
          </div>
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse"
            >
              {totalNotifications} New
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="invitations" className="relative">
              <div className="flex items-center gap-2">
                <span>Invitations</span>
                {notifications.invitations.length > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                    {notifications.invitations.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              <div className="flex items-center gap-2">
                <span>Join Requests</span>
                {notifications.joinRequests.length > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                    {notifications.joinRequests.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[450px] pr-2">
            {activeTab === "invitations" ? (
              notifications.invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-xl bg-zinc-50/50">
                  <Bell className="h-10 w-10 mb-2 text-zinc-400" />
                  <p className="text-sm font-medium">No new invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.invitations.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn(
                        "p-4 rounded-xl border transition-colors cursor-pointer bg-white hover:bg-zinc-50",
                        "border-zinc-200"
                      )}
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowDialog(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border">
                          {notification.community.image ? (
                            <AvatarImage src={notification.community.image} alt={notification.community.name} />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                              {notification.community.name[0].toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-950">
                            {notification.sender?.personal?.firstName || "Unknown"} {notification.sender?.personal?.lastName || ""}
                          </p>
                          <p className="text-sm text-zinc-600 mt-0.5">
                            invited you to join <span className="font-semibold text-zinc-900">{notification.community.name}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-400">
                              {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              notifications.joinRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-xl bg-zinc-50/50">
                  <Users className="h-10 w-10 mb-2 text-zinc-400" />
                  <p className="text-sm font-medium">No pending join requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.joinRequests.map((request) => (
                    <motion.div
                      key={`${request.community._id}-${request.user._id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn(
                        "p-4 rounded-xl border transition-colors cursor-pointer bg-white hover:bg-zinc-50",
                        "border-zinc-200"
                      )}
                      onClick={() => {
                        setSelectedNotification(request);
                        setShowDialog(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                            {request.user.firstName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-950">
                            {request.user.firstName} {request.user.lastName}
                          </p>
                          <p className="text-sm text-zinc-600 mt-0.5">
                            wants to join <span className="font-semibold text-zinc-900">{request.community.name}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-400">
                              {new Date(request.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </ScrollArea>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "invitations" ? "Community Invitation" : "Join Request"}
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {activeTab === "invitations" ? (
                    selectedNotification.community.image ? (
                      <AvatarImage 
                        src={selectedNotification.community.image} 
                        alt={selectedNotification.community.name} 
                      />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {selectedNotification.community.name[0].toUpperCase()}
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {selectedNotification.user.firstName[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    {activeTab === "invitations" 
                      ? selectedNotification.community.name
                      : `${selectedNotification.user.firstName} ${selectedNotification.user.lastName}`}
                  </h4>
                  {activeTab === "invitations" && (
                    <p className="text-sm text-muted-foreground">
                      {selectedNotification.community.description}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm">
                {activeTab === "invitations" ? (
                  <>
                    <span className="font-semibold">
                      {selectedNotification.sender?.personal?.firstName || "Unknown"}{" "}
                      {selectedNotification.sender?.personal?.lastName || ""}
                    </span>{" "}
                    has invited you to join this community
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {selectedNotification.user.firstName} {selectedNotification.user.lastName}
                    </span>{" "}
                    wants to join this community
                  </>
                )}
              </p>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => activeTab === "invitations" 
                    ? handleRejectInvitation(selectedNotification)
                    : handleRejectJoinRequest(selectedNotification)
                  }
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => activeTab === "invitations"
                    ? handleAcceptInvitation(selectedNotification)
                    : handleAcceptJoinRequest(selectedNotification)
                  }
                >
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notification;
