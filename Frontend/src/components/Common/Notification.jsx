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
      // Load community invitations
      const { data: invitations } = await MessageAPI.getInvitations();
      console.log("Direct Message Invitations:", invitations);
      
      // Load join requests for communities where user is admin/creator
      try {
        const { data: joinRequests } = await api.get('/api/messages/communities/join-requests');
        console.log("Join Requests Data:", joinRequests);
        setNotifications({
          invitations: invitations || [],
          joinRequests: Array.isArray(joinRequests) ? joinRequests : []
        });
      } catch (joinRequestError) {
        console.error("Error loading join requests:", joinRequestError);
        // If join requests fail, still show invitations
        setNotifications({
          invitations: invitations || [],
          joinRequests: []
        });
        // Show error toast to user
        toast.error("Failed to load join requests. Please try again later.");
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Show error toast to user
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

    // Handle new invitations
    const handleNewInvitation = (invitation) => {
      setNotifications(prev => ({
        ...prev,
        invitations: [...prev.invitations, invitation]
      }));
    };

    // Handle new join requests
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

  // Get total notification count
  const totalNotifications = notifications.invitations.length + notifications.joinRequests.length;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative group"
        onClick={() => setShowNotificationsList(!showNotificationsList)}
      >
        <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
        {totalNotifications > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
          >
            {totalNotifications}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {showNotificationsList && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg p-4 z-50 border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotificationsList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
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
            </Tabs>
            
            <ScrollArea className="h-[400px]">
              {activeTab === "invitations" ? (
                notifications.invitations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p>No new invitations</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.invitations.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          "hover:bg-accent/50"
                        )}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setActiveTab("invitations");
                          setShowDialog(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            {notification.community.image ? (
                              <AvatarImage src={notification.community.image} alt={notification.community.name} />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {notification.community.name[0].toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {notification.sender.personal.firstName} {notification.sender.personal.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              invited you to join {notification.community.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleDateString()}
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
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    <p>No pending join requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.joinRequests.map((request) => (
                      <motion.div
                        key={`${request.community._id}-${request.user._id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          "hover:bg-accent/50"
                        )}
                        onClick={() => {
                          setSelectedNotification(request);
                          setActiveTab("requests");
                          setShowDialog(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {request.user.firstName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {request.user.firstName} {request.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              wants to join {request.community.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString()}
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
          </motion.div>
        )}
      </AnimatePresence>

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
                      {selectedNotification.sender.personal.firstName}{" "}
                      {selectedNotification.sender.personal.lastName}
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
