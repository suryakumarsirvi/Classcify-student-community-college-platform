import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MessageAPI } from "@/api/message.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe,
  MessageSquare,
  Users,
  Compass,
  Plus,
  ArrowRight,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Community = () => {
  const navigate = useNavigate();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const fetchCommunitiesData = async () => {
    try {
      setLoading(true);
      const [joinedRes, allRes] = await Promise.all([
        MessageAPI.getUserCommunities(),
        MessageAPI.getAllCommunities(),
      ]);

      const joinedList = joinedRes?.data || [];
      const allList = allRes || [];

      setJoinedCommunities(joinedList);

      // Filter discover list: communities the student is NOT already a member of
      const joinedIds = new Set(joinedList.map((c) => c._id));
      const discoverList = allList.filter((c) => !joinedIds.has(c._id));
      setDiscoverCommunities(discoverList);
    } catch (err) {
      console.error("Failed to fetch communities:", err);
      toast.error("Unable to load campus communities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunitiesData();
  }, []);

  const handleJoinCommunity = async (communityId, name) => {
    try {
      setJoiningId(communityId);
      await MessageAPI.joinCommunity(communityId);
      toast.success(`Joined community "${name}"!`);
      
      // Re-trigger fetch to sync lists with server data
      await fetchCommunitiesData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to join space.");
    } finally {
      setJoiningId(null);
    }
  };

  const getGradientColor = (index) => {
    const gradients = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-cyan-500",
      "from-emerald-400 to-teal-600",
      "from-orange-400 to-rose-500",
      "from-pink-500 to-rose-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-8 md:p-10 shadow-lg overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="space-y-3 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Campus Social Circles
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Classcify Community Spaces
            </h1>
            <p className="text-indigo-100 text-sm md:text-base leading-relaxed">
              Connect with study groups, academic clubs, and interest societies across the campus. Instantly chat, share notes, and form revision cohorts.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Button
              onClick={() => navigate("/student/dashboard/create")}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-md cursor-pointer h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Launch A Space
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill().map((_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill().map((_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Active Joined Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Joined Communities</h2>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                  {joinedCommunities.length} Active
                </Badge>
              </div>

              {joinedCommunities.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center bg-white shadow-sm flex flex-col items-center max-w-md mx-auto">
                  <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-700">No Joined Spaces Yet</h3>
                  <p className="text-slate-400 text-xs mt-1 mb-4">
                    Explore available clubs campus-wide below, or create your own target workspace!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const discoverSec = document.getElementById("discovery-section");
                      if (discoverSec) discoverSec.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="cursor-pointer"
                  >
                    Discover Channels
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedCommunities.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col justify-between border-slate-100">
                        <div>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-32 w-full object-cover border-b"
                            />
                          ) : (
                            <div className={`h-32 w-full bg-gradient-to-br ${getGradientColor(idx)} border-b flex items-center justify-center`}>
                              <Users className="w-10 h-10 text-white/80" />
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">
                                {item.name}
                              </CardTitle>
                              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0 flex-shrink-0 flex items-center gap-1 text-[10px]">
                                <Users className="w-3 h-3" />
                                {item.members?.length || 1}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs line-clamp-3 mt-1 leading-relaxed">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                        </div>
                        <CardFooter className="pt-2 border-t border-slate-50">
                          <Button
                            onClick={() => navigate("/student/dashboard/messages")}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer h-9 text-xs"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Open Live Chat
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Discoverable Section */}
            <section id="discovery-section" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Campus Discovery</h2>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {discoverCommunities.length} Available
                </Badge>
              </div>

              {discoverCommunities.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-100 rounded-xl shadow-sm max-w-md mx-auto text-slate-400 text-xs">
                  All active campus channels are currently joined. Check back later for new group launches!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discoverCommunities.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col justify-between border-slate-100 bg-white">
                        <div>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-32 w-full object-cover border-b"
                            />
                          ) : (
                            <div className={`h-32 w-full bg-gradient-to-br ${getGradientColor(idx + 3)} border-b flex items-center justify-center`}>
                              <Globe className="w-10 h-10 text-white/80" />
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">
                                {item.name}
                              </CardTitle>
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 flex-shrink-0 flex items-center gap-1 text-[10px]">
                                <Users className="w-3 h-3" />
                                {item.members?.length || 1}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs line-clamp-3 mt-1 leading-relaxed">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                        </div>
                        <CardFooter className="pt-2 border-t border-slate-50">
                          <Button
                            onClick={() => handleJoinCommunity(item._id, item.name)}
                            disabled={joiningId === item._id}
                            variant="outline"
                            className="w-full border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold cursor-pointer h-9 text-xs transition-colors"
                          >
                            {joiningId === item._id ? (
                              "Joining Circle..."
                            ) : (
                              <>
                                Join Community
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
