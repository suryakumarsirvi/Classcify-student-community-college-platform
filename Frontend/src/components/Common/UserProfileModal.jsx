import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserProfileModal = ({ user, isOpen, onClose, userPosts = [] }) => {
  if (!user) return null;

  const { personal, academic, other } = user;
  const interests = other?.interests || [];
  const personalityType = other?.personalityType || "Not specified";

  // Personality traits mapping based on Type A/B
  const personalityTraits = {
    "Type A Extrovert": {
      "Competitive": 85,
      "Time-Urgent": 80,
      "Achievement-Oriented": 90,
      "Ambitious": 85,
      "Proactive": 75
    },
    "Type A Introvert": {
      "Perfectionist": 85,
      "Self-Critical": 80,
      "Task-Focused": 90,
      "Reserved": 75,
      "Detail-Oriented": 85
    },
    "Type B Extrovert": {
      "Relaxed": 85,
      "Social": 90,
      "Patient": 75,
      "Easy-going": 80,
      "Flexible": 85
    },
    "Type B Introvert": {
      "Calm": 85,
      "Reflective": 90,
      "Patient": 80,
      "Independent": 75,
      "Creative": 85
    }
  }[personalityType] || {};

  console.log("User Posts in Modal:", userPosts); // Debug log

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {personal?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">
                    {personal?.firstName} {personal?.lastName}
                  </CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {academic?.course?.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {academic?.collegeName}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="interests">Interests</TabsTrigger>
                <TabsTrigger value="personality">Personality</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Course</p>
                        <p>{academic?.course?.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">College</p>
                        <p>{academic?.collegeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Standard</p>
                        <p>{academic?.standard?.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stream</p>
                        <p>{academic?.stream?.toUpperCase()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interests" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Interests & Hobbies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-base py-2">
                          {interest}
                        </Badge>
                      ))}
                      {interests.length === 0 && (
                        <p className="text-muted-foreground">No interests specified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personality" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personality Type: {personalityType}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(personalityTraits).map(([trait, value]) => (
                        <div key={trait} className="space-y-1">
                          <p className="font-medium">{trait}</p>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="posts" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {userPosts && userPosts.length > 0 ? (
                        userPosts.map((post) => (
                          <div key={post._id} className="aspect-square overflow-hidden rounded-lg relative group">
                            {post?.media?.resource_type === "video" ? (
                              <video
                                src={post?.media?.url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            ) : (
                              <img
                                src={post?.media?.url}
                                alt={post?.caption}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <p className="text-white text-sm line-clamp-2">
                                {post?.caption}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 py-8 text-center text-muted-foreground">
                          No posts yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal; 