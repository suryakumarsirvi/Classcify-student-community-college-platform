import React, { useEffect, useState } from "react";
import { Bell, Check, X, Clock, Users, ShieldAlert, Sparkles, Inbox, ArrowRight } from "lucide-react";
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
import Spinner from "@/components/ui/spinner";

const Notification = () => {
  const [notifications, setNotifications] = useState({
    invitations: [],
    joinRequests: []
  });
  const [activeTab, setActiveTab] = useState("invitations");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Fix: MessageAPI.getInvitations() returns the array of data directly, not an axios response object
      const invitations = await MessageAPI.getInvitations();
      console.log("Direct Message Invitations Loaded:", invitations);
      
      try {
        const { data: joinRequests } = await api.get('/api/messages/communities/join-requests');
        console.log("Join Requests Data:", joinRequests);
        setNotifications({
          invitations: Array.isArray(invitations) ? invitations : [],
          joinRequests: Array.isArray(joinRequests) ? joinRequests : []
        });
      } catch (joinRequestError) {
        console.error("Error loading join requests:", joinRequestError);
        setNotifications({
          invitations: Array.isArray(invitations) ? invitations : [],
          joinRequests: []
        });
        toast.error("Failed to load join requests");
      }

      // Dispatch custom event to notify sidebar to clear badge
      window.dispatchEvent(new CustomEvent('clear-notifications-badge'));
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
      setNotifications({
        invitations: [],
        joinRequests: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    if (!socket) return;

    const handleNewInvitation = (invitation) => {
      setNotifications(prev => ({
        ...prev,
        invitations: [invitation, ...prev.invitations]
      }));
      // Auto-clear badge since user is on the notification page
      window.dispatchEvent(new CustomEvent('clear-notifications-badge'));
    };

    const handleJoinRequest = (request) => {
      setNotifications(prev => ({
        ...prev,
        joinRequests: [request, ...prev.joinRequests]
      }));
      // Auto-clear badge since user is on the notification page
      window.dispatchEvent(new CustomEvent('clear-notifications-badge'));
    };

    socket.on("new-invitation", handleNewInvitation);
    socket.on("join-request-received", handleJoinRequest);

    return () => {
      socket.off("new-invitation", handleNewInvitation);
      socket.off("join-request-received", handleJoinRequest);
    };
  }, [socket]);

  // Dispatch badge clear when activeTab changes as extra assurance
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('clear-notifications-badge'));
  }, [activeTab]);

  const handleAcceptInvitation = async (notification) => {
    try {
      await MessageAPI.acceptInvitation(notification._id);
      setNotifications(prev => ({
        ...prev,
        invitations: prev.invitations.filter(n => n._id !== notification._id)
      }));
      toast.success("Successfully joined community!");
      setShowDialog(false);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    }
  };

  const handleRejectInvitation = async (notification) => {
    try {
      await MessageAPI.rejectInvitation(notification._id);
      setNotifications(prev => ({
        ...prev,
        invitations: prev.invitations.filter(n => n._id !== notification._id)
      }));
      toast.success("Invitation declined");
      setShowDialog(false);
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error("Failed to reject invitation");
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
      toast.success("Accepted join request!");
      setShowDialog(false);
    } catch (error) {
      console.error("Error accepting join request:", error);
      toast.error("Failed to accept join request");
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
      toast.success("Rejected join request");
      setShowDialog(false);
    } catch (error) {
      console.error("Error rejecting join request:", error);
      toast.error("Failed to reject join request");
    }
  };

  const totalNotifications = notifications.invitations.length + notifications.joinRequests.length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-100 flex flex-col flex-1 min-h-[550px] overflow-hidden">
        
        {/* Premium Header */}
        <div className="px-8 py-6 border-b border-zinc-100 bg-gradient-to-r from-indigo-50/30 via-white to-zinc-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Notifications Hub</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Manage community invitations and member requests in real-time</p>
            </div>
          </div>
          {totalNotifications > 0 && (
            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 shadow-sm animate-pulse">
              <Sparkles className="h-3 w-3" />
              {totalNotifications} Pending
            </Badge>
          )}
        </div>

        {/* Tab Controls & Workspace */}
        <div className="p-8 flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 max-w-md bg-zinc-100/80 p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="invitations" 
                className="rounded-lg text-sm py-2 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Invitations</span>
                  {notifications.invitations.length > 0 && (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold rounded-md px-1.5 py-0.5 text-[10px]">
                      {notifications.invitations.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="rounded-lg text-sm py-2 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Join Requests</span>
                  {notifications.joinRequests.length > 0 && (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold rounded-md px-1.5 py-0.5 text-[10px]">
                      {notifications.joinRequests.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            {/* List Body */}
            <ScrollArea className="flex-1 pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                  <Spinner size="md" className="mb-3" />
                  <p className="text-sm font-medium">Loading notifications...</p>
                </div>
              ) : activeTab === "invitations" ? (
                <AnimatePresence mode="popLayout">
                  {notifications.invitations.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-zinc-400 border border-dashed rounded-2xl bg-zinc-50/50 p-6"
                    >
                      <Inbox className="h-10 w-10 mb-3 text-zinc-300" />
                      <p className="text-sm font-semibold text-zinc-700">Inbox is empty</p>
                      <p className="text-xs text-zinc-400 mt-1">You have no new community invitations at the moment.</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notifications.invitations.map((notification) => (
                        <motion.div
                          key={notification._id}
                          layoutId={notification._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-indigo-100"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowDialog(true);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border border-zinc-100 shadow-sm rounded-xl overflow-hidden">
                              {notification.community.image ? (
                                <AvatarImage src={notification.community.image} alt={notification.community.name} className="object-cover" />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-lg rounded-xl">
                                  {notification.community.name[0].toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-zinc-950 truncate group-hover:text-indigo-600 transition-colors">
                                {notification.community.name}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-1">
                                Invited by <span className="font-semibold text-zinc-700">{notification.sender?.name || "Anonymous"}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-3 text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-medium tracking-wide">
                                  {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-50 pt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-zinc-500 hover:text-zinc-900 h-8 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectInvitation(notification);
                              }}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-lg shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptInvitation(notification);
                              }}
                            >
                              Join Group
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.joinRequests.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-zinc-400 border border-dashed rounded-2xl bg-zinc-50/50 p-6"
                    >
                      <Users className="h-10 w-10 mb-3 text-zinc-300" />
                      <p className="text-sm font-semibold text-zinc-700">No requests pending</p>
                      <p className="text-xs text-zinc-400 mt-1">All classroom or community requests have been resolved.</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notifications.joinRequests.map((request) => (
                        <motion.div
                          key={`${request.community._id}-${request.user._id}`}
                          layoutId={`${request.community._id}-${request.user._id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-indigo-100"
                          onClick={() => {
                            setSelectedNotification(request);
                            setShowDialog(true);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border border-zinc-100 shadow-sm rounded-xl overflow-hidden">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-zinc-100 text-indigo-700 font-bold text-lg rounded-xl">
                                {request.user.name?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-zinc-950 truncate">
                                {request.user.name}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-1">
                                wants to join <span className="font-semibold text-indigo-600">{request.community.name}</span>
                              </p>
                              {request.user.email && (
                                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{request.user.email}</p>
                              )}
                              <div className="flex items-center gap-2 mt-3 text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-medium tracking-wide">
                                  {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'Recent'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-50 pt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-zinc-500 hover:text-zinc-900 h-8 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectJoinRequest(request);
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-lg shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptJoinRequest(request);
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </div>

      {/* Modern Popover Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-zinc-100 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 text-lg font-bold flex items-center gap-2">
              {activeTab === "invitations" ? (
                <>
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <span>Invitation Details</span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Request Verification</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50/50 border border-zinc-100">
                <Avatar className="h-16 w-16 border rounded-xl overflow-hidden">
                  {activeTab === "invitations" ? (
                    selectedNotification.community.image ? (
                      <AvatarImage 
                        src={selectedNotification.community.image} 
                        alt={selectedNotification.community.name}
                        className="object-cover" 
                      />
                    ) : (
                      <AvatarFallback className="bg-indigo-600 text-white font-bold text-2xl">
                        {selectedNotification.community.name[0].toUpperCase()}
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-2xl">
                      {selectedNotification.user.name[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-zinc-900 truncate">
                    {activeTab === "invitations" 
                      ? selectedNotification.community.name
                      : selectedNotification.user.name}
                  </h4>
                  {activeTab === "invitations" && selectedNotification.community.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {selectedNotification.community.description}
                    </p>
                  )}
                  {activeTab === "requests" && selectedNotification.user.email && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {selectedNotification.user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-sm text-zinc-600 leading-relaxed px-1">
                {activeTab === "invitations" ? (
                  <p>
                    <span className="font-bold text-zinc-900">{selectedNotification.sender?.name || "Unknown"}</span> has invited you to join the community <span className="font-semibold text-indigo-600">{selectedNotification.community.name}</span>. Accepting this request will add you to their member roster instantly.
                  </p>
                ) : (
                  <p>
                    <span className="font-bold text-zinc-900">{selectedNotification.user.name}</span> is requesting permission to join the community <span className="font-semibold text-indigo-600">{selectedNotification.community.name}</span>. Verify and approve to let them participate in discussions.
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  className="rounded-xl px-4 py-2 border-zinc-200 text-zinc-700 text-sm hover:bg-zinc-50 transition-all cursor-pointer"
                  onClick={() => activeTab === "invitations" 
                    ? handleRejectInvitation(selectedNotification)
                    : handleRejectJoinRequest(selectedNotification)
                  }
                >
                  Decline
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm shadow-sm transition-all cursor-pointer"
                  onClick={() => activeTab === "invitations"
                    ? handleAcceptInvitation(selectedNotification)
                    : handleAcceptJoinRequest(selectedNotification)
                  }
                >
                  Approve & Accept
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
