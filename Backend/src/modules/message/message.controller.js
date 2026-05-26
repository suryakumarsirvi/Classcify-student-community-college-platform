import messageService from './message.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

export const createCommunity = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, 'Name and description are required');
  }

  const fileBuffer = req.file ? req.file.buffer : null;
  const formattedCommunity = await messageService.createCommunity(
    req.user._id || req.user.id,
    req.user.role,
    name,
    description,
    fileBuffer
  );

  res.status(201).json({
    message: 'Community created successfully',
    community: formattedCommunity
  });
});

export const getAllCommunities = asyncHandler(async (req, res) => {
  const communities = await messageService.getAllCommunities(req.user._id || req.user.id);
  res.json(communities);
});

export const getCommunityDetails = asyncHandler(async (req, res) => {
  const community = await messageService.getCommunityDetails(req.params.id);
  res.json(community);
});

export const sendInvitation = asyncHandler(async (req, res) => {
  const { userId, senderType, senderName } = req.body;
  const communityId = req.params.communityId;

  const { newInvitation, community } = await messageService.sendInvitation(
    communityId,
    req.user._id || req.user.id,
    req.user.role,
    userId,
    senderType,
    senderName
  );

  if (req.io) {
    req.io.to(userId).emit('newInvitation', {
      invitation: newInvitation,
      community: community,
      senderName: senderName
    });
  }

  res.status(200).json({
    success: true,
    message: 'Invitation sent successfully',
    data: { invitation: newInvitation }
  });
});

export const getInvitations = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const userType = req.user.role || 'Student';
  const list = await messageService.getInvitations(userId, userType);
  res.status(200).json({
    success: true,
    message: 'Invitations retrieved successfully',
    data: list
  });
});

export const dismissNotification = asyncHandler(async (req, res) => {
  const invitation = await messageService.dismissNotification(req.params.invitationId);
  if (req.io) {
    req.io.to(invitation.recipient.toString()).emit('notification-dismissed', invitation._id);
  }
  res.json({ message: 'Invitation dismissed successfully' });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const communityData = await messageService.acceptInvitation(req.params.invitationId, req.user._id || req.user.id);

  if (req.io) {
    req.io.to(req.user._id.toString()).emit('invitation-accepted', communityData);
    req.io.to(communityData.creator.toString()).emit('member-joined', {
      communityId: communityData._id,
      newMember: {
        _id: req.user._id,
        name: req.user.personal?.firstName || 'New member'
      }
    });
  }

  res.json({
    message: 'Successfully joined community!',
    community: communityData
  });
});

export const sendDirectMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, conversationId } = req.body;
  if (!receiverId || !content) {
    throw new ApiError(400, 'Receiver ID and content are required');
  }

  const { formattedMessage, conversation } = await messageService.sendDirectMessage(
    req.user._id || req.user.id,
    req.user.role,
    receiverId,
    content,
    conversationId
  );

  if (req.io) {
    const senderId = req.user._id || req.user.id;
    req.io.to(senderId.toString()).emit('new-message', {
      ...formattedMessage,
      type: 'sent'
    });
    req.io.to(receiverId.toString()).emit('new-message', {
      ...formattedMessage,
      type: 'received'
    });

    const conversationUpdate = {
      _id: conversation._id,
      lastMessage: formattedMessage,
      lastMessageAt: conversation.lastMessageAt,
      updatedAt: conversation.updatedAt,
      participants: conversation.participants
    };

    req.io.to(senderId.toString()).emit('conversation-updated', conversationUpdate);
    req.io.to(receiverId.toString()).emit('conversation-updated', conversationUpdate);
  }

  res.status(201).json(formattedMessage);
});

export const sendCommunityMessage = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { content, senderType, senderName, isAdmin } = req.body;

  const populatedMessage = await messageService.sendCommunityMessage(
    req.user._id || req.user.id,
    req.user.role,
    senderName,
    isAdmin,
    communityId,
    content
  );

  if (req.io) {
    req.io.to(communityId).emit('new-community-message', {
      _id: populatedMessage._id,
      sender: populatedMessage.sender,
      content: populatedMessage.content,
      community: communityId,
      createdAt: populatedMessage.createdAt
    });
  }

  res.status(201).json(populatedMessage);
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getConversationMessages(req.params.conversationId);
  res.status(200).json({ success: true, messages });
});

export const getDirectMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getDirectMessages(req.user._id || req.user.id, req.params.receiverId);
  res.status(200).json(messages);
});

export const getCommunityMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getCommunityMessages(req.params.communityId);
  res.status(200).json(messages);
});

export const getUserConversations = asyncHandler(async (req, res) => {
  const formattedConversations = await messageService.getUserConversations(req.user._id || req.user.id);
  res.status(200).json(formattedConversations);
});

export const createConversation = asyncHandler(async (req, res) => {
  const { participants } = req.body;
  const result = await messageService.createConversation(req.user._id || req.user.id, req.user.role, participants);
  res.status(result.existing ? 200 : 201).json({
    success: true,
    message: result.existing ? 'Conversation already exists' : 'Conversation created successfully',
    conversation: result.conversation
  });
});

export const searchCommunities = asyncHandler(async (req, res) => {
  const query = req.query.query || req.query.q;
  if (!query) {
    throw new ApiError(400, 'Search query is required');
  }

  const list = await messageService.searchCommunities(query);
  res.json(list);
});

export const sendJoinRequest = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { userId, userType, user } = req.body;

  const community = await messageService.sendJoinRequest(communityId, userId, userType, user);

  if (req.io) {
    req.io.to(community.creator.toString()).emit('join-request-received', {
      communityId: community._id,
      communityName: community.name,
      user: {
        _id: userId,
        name: user?.name || 'User',
        type: userType || 'Student'
      }
    });
  }

  res.status(200).json({ message: 'Join request sent successfully' });
});

export const acceptJoinRequest = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;
  const community = await messageService.acceptJoinRequest(communityId, userId, req.user._id || req.user.id);

  if (req.io) {
    req.io.to(userId).emit('join-request-accepted', {
      communityId: community._id,
      communityName: community.name
    });
  }

  res.status(200).json({ message: 'Join request accepted' });
});

export const rejectJoinRequest = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;
  const community = await messageService.rejectJoinRequest(communityId, userId, req.user._id || req.user.id);

  if (req.io) {
    req.io.to(userId).emit('join-request-rejected', {
      communityId: community._id,
      communityName: community.name
    });
  }

  res.status(200).json({ message: 'Join request rejected' });
});

export const getJoinRequests = asyncHandler(async (req, res) => {
  const list = await messageService.getJoinRequests(req.user._id || req.user.id);
  res.status(200).json({
    success: true,
    message: 'Join requests retrieved successfully',
    data: list
  });
});

export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const count = await messageService.markMessagesAsRead(conversationId, req.user._id || req.user.id, req.user.role);

  if (req.io) {
    req.io.to(conversationId).emit('messages-read', {
      conversationId,
      userId: req.user._id || req.user.id,
      count
    });
  }

  res.status(200).json({
    success: true,
    message: 'Messages marked as read',
    count
  });
});
