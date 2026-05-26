// UserCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const UserCard = ({ user, className = "", variant = "suggested" }) => {
    const { personal, academic } = user;

    if (variant === "suggested") {
        return (
            <Card className={`group hover:shadow-md transition-all border-primary/10 ${className}`}>
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/10">
                            <AvatarFallback className="text-sm bg-primary/5 font-medium">
                                {personal?.firstName?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm leading-none truncate">
                                    {personal?.firstName} {personal?.lastName}
                                </h3>
                                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                                    {academic?.course}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                {academic?.collegeName} • {academic?.standard}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default variant for explore/search results
    return (
        <Card className={`group hover:shadow-md transition-all border-primary/10 ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarFallback className="text-xl bg-primary/5 font-medium">
                            {personal?.firstName?.[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg leading-none">
                                {personal?.firstName} {personal?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {academic?.course?.toUpperCase()} • {academic?.standard?.toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {academic?.collegeName}
                            </p>
                        </div>

                        {user.other?.interests?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {user.other.interests.slice(0, 3).map((interest, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-2 py-0.5 text-xs"
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                                {user.other.interests.length > 3 && (
                                    <Badge
                                        variant="outline"
                                        className="px-2 py-0.5 text-xs"
                                    >
                                        +{user.other.interests.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserCard;
