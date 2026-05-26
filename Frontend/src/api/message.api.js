import api from "./axios";

// Consolidate all message and community related functions under one export
export const MessageAPI = {
    // Community Related APIs
    createCommunity: async (formData) => {
        try {
            // Get the current user's token
            const token = localStorage.getItem('adminToken') ||
                localStorage.getItem('teacherToken') ||
                localStorage.getItem('studentToken');

            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            // Get user info from token
            const userToken = token.split('.')[1];
            const userData = JSON.parse(atob(userToken));

            if (!userData || !userData.id) {
                throw new Error("Invalid user data in token");
            }

            const userId = userData.id;
            const userRole = userData.role || 'student';

            // Validate required fields
            if (!formData.get('name')) {
                throw new Error("Community name is required");
            }

            // Create member and admin objects with proper structure
            const memberObj = {
                user: {
                    _id: userId,
                    role: userRole,
                    name: userData.name || 'Unknown User'
                },
                joinedAt: new Date().toISOString()
            };

            // Add required fields to FormData
            formData.append('creator', userId);
            formData.append('creatorRole', userRole);
            formData.append('members', JSON.stringify([memberObj]));
            formData.append('admins', JSON.stringify([memberObj]));
            formData.append('createdAt', new Date().toISOString());
            formData.append('updatedAt', new Date().toISOString());

            console.log("Creating community with formData:", formData);
            // Log form data contents
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.post('/api/messages/communities', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Community creation response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating community:', error.response?.data || error.message);
            throw error;
        }
    },

    getUserCommunities: async () => {
        try {
            const response = await api.get('/api/messages/communities');
            return response;
        } catch (error) {
            console.error('Error fetching communities:', error);
            throw error;
        }
    },

    getCommunityDetails: async (id) => {
        try {
            const response = await api.get(`/api/messages/communities/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching community details:', error);
            throw error;
        }
    },

    joinCommunity: async (communityId) => {
        try {
            const response = await api.post(`/api/messages/communities/${communityId}/join`);
            return response;
        } catch (error) {
            console.error('Error joining community:', error);
            throw error;
        }
    },

    leaveCommunity: async (communityId) => {
        try {
            const response = await api.post(`/api/messages/communities/${communityId}/leave`);
            return response;
        } catch (error) {
            console.error('Error leaving community:', error);
            throw error;
        }
    },

    getAllCommunities: async () => {
        try {
            const res = await api.get('/api/messages/all-communities');
            return res.data;
        } catch (error) {
            console.error('Error fetching all communities:', error);
            throw error.response?.data || error.message;
        }
    },

    sendInvitation: async (data) => {
        try {
            const response = await api.post(`/api/messages/communities/${data.communityId}/invite`, {
                userId: data.userId,
                senderType: data.senderType,
                senderName: data.senderName
            });
            return response;
        } catch (error) {
            console.error('Error sending invitation:', error);
            throw error;
        }
    },

    acceptInvitation: async (invitationId) => {
        try {
            const response = await api.patch(`/api/invitations/${invitationId}/accept`);
            return response;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            throw error;
        }
    },

    rejectInvitation: async (invitationId) => {
        try {
            const response = await api.post(`/api/messages/communities/invite/${invitationId}/reject`);
            return response;
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            throw error;
        }
    },

    getInvitations: async () => {
        try {
            const response = await api.get('/api/messages/invitations');
            if (!response.data || !response.data.data) {
                console.warn('No invitations data found in response');
                return [];
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching invitations:', error);
            if (error.response?.data?.error === 'An invitation is already pending for this user') {
                throw new Error('An invitation is already pending for this user');
            }
            throw error;
        }
    },

    // Message Related APIs
    sendCommunityMessage: async (communityId, messageData) => {
        try {
            // First check if community exists and get its details
            const communityResponse = await api.get(`/api/messages/communities/${communityId}`);
            const community = communityResponse.data;

            if (!community) {
                throw new Error("Community not found");
            }

            // Get the current user's token
            const token = localStorage.getItem('adminToken') ||
                localStorage.getItem('teacherToken') ||
                localStorage.getItem('studentToken');

            // Check if user is admin, member, or creator
            const userId = messageData.sender;
            const isAdmin = community.admins?.some(admin => admin._id === userId);
            const isMember = community.members?.some(member => member._id === userId);
            const isCreator = community.creator?._id === userId;

            if (!isAdmin && !isMember && !isCreator) {
                // If not a member, send join request
                try {
                    await api.post(`/api/messages/communities/${communityId}/request`, {
                        userId: userId,
                        senderType: messageData.senderType,
                        senderName: messageData.senderName
                    });
                    throw new Error("You need to be a member to send messages. A join request has been sent to the community admin.");
                } catch (joinError) {
                    console.error("Error sending join request:", joinError);
                    if (joinError.response?.status === 400) {
                        throw new Error("You already have a pending join request for this community.");
                    }
                    throw new Error("Failed to send join request. Please try again later.");
                }
            }

            // Prepare complete message data with all required fields
            const completeMessageData = {
                content: messageData.content,
                sender: messageData.sender,
                conversation: communityId, // Add conversation field
                senderType: messageData.senderType || 'student', // Ensure senderType is present
                senderName: messageData.senderName || 'Unknown User', // Ensure senderName is present
                timestamp: new Date().toISOString(), // Add timestamp
                isAdmin: isAdmin || isCreator // Set isAdmin flag
            };

            console.log("Sending message with data:", completeMessageData);

            // Now send the message
            const response = await api.post(
                `/api/messages/community/${communityId}`,
                completeMessageData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Message sent successfully:", response.data);
            return response;
        } catch (error) {
            console.error('Error in sendCommunityMessage:', error.response?.data || error.message);
            throw error;
        }
    },

    sendDirectMessage: async (messageData) => {
        try {
            const response = await api.post('/api/messages/direct', messageData);
            return response;
        } catch (error) {
            console.error('Error sending direct message:', error);
            throw error;
        }
    },

    getDirectMessages: async (userId) => {
        try {
            console.log(`📥 Fetching direct messages for user: ${userId}`);
            const response = await api.get(`/api/messages/direct/${userId}`);
            console.log(`📨 Direct messages response:`, response.data);
            return response;
        } catch (error) {
            console.error(`❌ Error fetching direct messages for user ${userId}:`, error);
            throw error;
        }
    },

    getCommunityMessages: async (communityId) => {
        try {
            const response = await api.get(`/api/messages/messages/community/${communityId}`);
            return response;
        } catch (error) {
            console.error('Error fetching community messages:', error);
            throw error;
        }
    },

    getConversationMessages: async (conversationId) => {
        try {
            const response = await api.get(`/api/messages/community/${conversationId}`);
            return response;
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            throw error;
        }
    },

    // Conversation Related APIs
    createConversation: async (data) => {
        try {
            const response = await api.post('/api/messages/conversations', data);
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    },

    // Get all conversations for the current user
    getUserConversations: async () => {
        try {
            const response = await api.get('/api/messages/conversations');
            return response;
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            throw error;
        }
    },

    sendJoinRequest: async (communityId, user) => {
        try {
            const response = await api.post(`/api/messages/communities/${communityId}/join-request`, {
                userId: user._id,
                userType: user.role || 'Student',
                user: {
                    _id: user._id,
                    name: user.personal?.firstName || "User",
                    type: user.role || 'Student'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};