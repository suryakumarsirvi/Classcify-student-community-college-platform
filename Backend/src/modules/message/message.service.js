import messageRepository from './implementations/message.repository.js';
import cloudinaryService from '../../services/storage/cloudinary.service.js';
import Student from '../../database/models/student.model.js';
import Teacher from '../../database/models/teacher.model.js';
import Admin from '../../database/models/admin.model.js';
import Community from '../../database/models/community.model.js';
import Invitation from '../../database/models/invitation.model.js';
import Message from '../../database/models/message.model.js';
import Conversation from '../../database/models/conversation.model.js';
import ApiError from '../../utils/ApiError.js';

class MessageService {
  async createCommunity(userId, role, name, description, fileBuffer) {
    let imageUrl = '';
    if (fileBuffer) {
      try {
        const result = await cloudinaryService.upload(fileBuffer, 'classcify/communities', 'image');
        imageUrl = result.secure_url;
      } catch (uploadError) {
        imageUrl = '';
      }
    }

    const creatorType = role || 'Student';
    const newCommunity = await messageRepository.createCommunity({
      name,
      description,
      image: imageUrl,
      creator: userId,
      members: [userId],
      creatorType
    });

    let creatorDetails = null;
    if (creatorType === 'admin') {
      creatorDetails = await Admin.findById(userId).select('name personal.firstName personal.lastName role');
    } else if (creatorType === 'teacher') {
      creatorDetails = await Teacher.findById(userId).select('name personal.firstName personal.lastName role');
    } else {
      creatorDetails = await Student.findById(userId).select('name personal.firstName personal.lastName role');
    }

    const memberDetails = await Promise.all(
      newCommunity.members.map(async (memberId) => {
        const member = await Student.findById(memberId) ||
          await Teacher.findById(memberId) ||
          await Admin.findById(memberId);

        return {
          _id: member._id,
          name: member.name || `${member.personal?.firstName || ''} ${member.personal?.lastName || ''}`.trim(),
          type: member.role || 'Student'
        };
      })
    );

    return {
      _id: newCommunity._id,
      name: newCommunity.name,
      description: newCommunity.description,
      image: newCommunity.image,
      members: memberDetails,
      creator: {
        _id: creatorDetails._id,
        name: creatorDetails.name || `${creatorDetails.personal?.firstName || ''} ${creatorDetails.personal?.lastName || ''}`.trim(),
        type: creatorDetails.role || 'Student'
      }
    };
  }

  async getAllCommunities(userId) {
    return await messageRepository.findCommunitiesByUser(userId);
  }

  async getCommunityDetails(id) {
    return await messageRepository.findCommunityById(id);
  }

  async sendInvitation(communityId, senderId, senderRole, recipientId, recipientRole, senderName) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    const isMember = community.members.includes(recipientId);
    if (isMember) {
      throw new ApiError(400, 'User is already a member of this community');
    }

    const existingInvitation = await messageRepository.findPendingInvitation(communityId, recipientId);
    if (existingInvitation) {
      throw new ApiError(400, 'An invitation is already pending for this user');
    }

    const newInvitation = await messageRepository.createInvitation({
      community: communityId,
      sender: senderId,
      senderType: senderRole || 'Student',
      recipient: recipientId,
      recipientType: recipientRole || 'Student',
      status: 'pending'
    });

    return { newInvitation, community };
  }

  async getInvitations(userId, userType) {
    const invitations = await Invitation.find({
      recipient: userId,
      recipientType: userType,
      status: 'pending'
    })
      .populate('community', 'name image')
      .populate({
        path: 'sender',
        select: 'personal.firstName personal.lastName role',
        model: userType
      });

    return invitations.map(invitation => {
      const senderName = invitation.sender
        ? `${invitation.sender.personal?.firstName || ''} ${invitation.sender.personal?.lastName || ''}`.trim()
        : 'Unknown User';

      return {
        _id: invitation._id,
        community: {
          _id: invitation.community._id,
          name: invitation.community.name,
          image: invitation.community.image
        },
        sender: {
          _id: invitation.sender?._id || null,
          name: senderName,
          type: invitation.sender?.role || 'Student'
        },
        status: invitation.status,
        createdAt: invitation.createdAt
      };
    });
  }

  async dismissNotification(invitationId) {
    const invitation = await messageRepository.deleteInvitation(invitationId);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found');
    }
    return invitation;
  }

  async acceptInvitation(invitationId, userId) {
    const invitation = await Invitation.findById(invitationId).populate('community');
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found');
    }

    if (invitation.recipient.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    await Community.findByIdAndUpdate(
      invitation.community._id,
      { $addToSet: { members: userId } }
    );

    await Student.findByIdAndUpdate(userId, {
      $addToSet: { community: invitation.community._id }
    });

    invitation.status = 'accepted';
    await invitation.save();

    const updatedCommunity = await Community.findById(invitation.community._id)
      .populate('members', 'personal')
      .populate('creator', 'personal');

    const communityMessages = await Message.find({ community: invitation.community._id })
      .sort({ createdAt: 1 });

    return {
      _id: updatedCommunity._id,
      name: updatedCommunity.name,
      image: updatedCommunity.image,
      members: updatedCommunity.members.map(member => ({
        _id: member._id,
        firstName: member.personal?.firstName,
        lastName: member.personal?.lastName,
        email: member.personal?.email
      })),
      messages: communityMessages,
      creator: updatedCommunity.creator
    };
  }

  async sendDirectMessage(senderId, senderRole, receiverId, content, conversationId) {
    const senderType = senderRole === 'admin' ? 'Admin' : senderRole === 'teacher' ? 'Teacher' : 'Student';

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new ApiError(404, 'Conversation not found');
      }
    } else {
      conversation = new Conversation({
        participants: [
          { participantId: senderId, participantType: senderType },
          { participantId: receiverId, participantType: 'Student' }
        ],
        type: 'direct',
        lastMessageSender: senderId,
        lastMessageSenderType: senderType,
        lastMessageAt: new Date()
      });
      await conversation.save();
    }

    const savedMessage = await messageRepository.saveMessage({
      senderId,
      senderType,
      receiverId,
      content,
      conversationId: conversation._id
    });

    const senderModel = senderType === 'Admin' ? Admin : senderType === 'Teacher' ? Teacher : Student;
    await senderModel.findByIdAndUpdate(
      senderId,
      {
        $push: {
          messageHistory: {
            messageId: savedMessage._id,
            conversationId: conversation._id,
            type: 'sent',
            status: 'sent',
            timestamp: new Date()
          }
        }
      }
    );

    await Student.findByIdAndUpdate(
      receiverId,
      {
        $push: {
          messageHistory: {
            messageId: savedMessage._id,
            conversationId: conversation._id,
            type: 'received',
            status: 'sent',
            timestamp: new Date()
          }
        }
      }
    );

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'personal.firstName personal.lastName name')
      .populate('receiver', 'personal.firstName personal.lastName name');

    const formattedMessage = {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      createdAt: populatedMessage.createdAt,
      status: populatedMessage.status,
      sender: {
        _id: populatedMessage.sender._id,
        name: populatedMessage.sender.name ||
          `${populatedMessage.sender.personal?.firstName || ''} ${populatedMessage.sender.personal?.lastName || ''}`.trim(),
        type: senderType
      },
      receiver: {
        _id: populatedMessage.receiver._id,
        name: populatedMessage.receiver.name ||
          `${populatedMessage.receiver.personal?.firstName || ''} ${populatedMessage.receiver.personal?.lastName || ''}`.trim(),
        type: 'Student'
      },
      conversation: conversation._id
    };

    return { formattedMessage, conversation };
  }

  async sendCommunityMessage(senderId, senderRole, senderName, isAdmin, communityId, content) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    const isMember = community.members.some(id => id.toString() === senderId.toString());
    if (!isMember) {
      throw new ApiError(403, 'You must be a member to send messages');
    }

    const type = senderRole === 'student' ? 'Student' : senderRole === 'teacher' ? 'Teacher' : senderRole === 'admin' ? 'Admin' : 'Student';

    const newMessage = new Message({
      sender: senderId,
      community: communityId,
      conversation: communityId,
      content,
      senderType: type,
      senderName: senderName || 'Unknown User',
      isAdmin: isAdmin || false,
      timestamp: new Date()
    });

    await newMessage.save();

    return await Message.findById(newMessage._id)
      .populate({
        path: 'sender',
        select: 'personal.firstName personal.lastName type'
      });
  }

  async getConversationMessages(conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    return await Message.find({
      $or: [
        { sender: { $in: conversation.participants.map(p => p.participantId) } },
        { receiver: { $in: conversation.participants.map(p => p.participantId) } }
      ]
    }).sort({ createdAt: 1 });
  }

  async getDirectMessages(senderId, receiverId) {
    return await messageRepository.getDirectMessages(senderId, receiverId);
  }

  async getCommunityMessages(communityId) {
    return await messageRepository.getCommunityMessages(communityId);
  }

  async getUserConversations(userId) {
    const conversations = await messageRepository.getUserConversations(userId);

    return conversations.map(conv => {
      const formatParticipant = (p) => {
        const userDoc = p.participantId;
        if (!userDoc) return { _id: p.participantId, participantType: p.participantType, name: 'Unknown User' };
        return {
          _id: userDoc._id,
          firstName: userDoc.personal?.firstName || userDoc.name,
          lastName: userDoc.personal?.lastName || '',
          email: userDoc.personal?.email || userDoc.email,
          participantType: p.participantType
        };
      };

      const formatLastSender = (senderDoc) => {
        if (!senderDoc) return null;
        return {
          _id: senderDoc._id,
          firstName: senderDoc.personal?.firstName || senderDoc.name,
          lastName: senderDoc.personal?.lastName || ''
        };
      };

      return {
        _id: conv._id,
        type: conv.type,
        participants: conv.participants.map(formatParticipant),
        community: conv.community,
        lastMessageSender: formatLastSender(conv.lastMessageSender),
        lastMessageAt: conv.lastMessageAt,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });
  }

  async createConversation(creatorId, role, participantInput) {
    const creatorType = role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student';

    if (!participantInput || participantInput.length < 1) {
      throw new ApiError(400, 'At least one recipient is required');
    }

    const participantIds = [creatorId, ...participantInput.map(p => p._id)];
    const participantsWithTypes = [
      { participantId: creatorId, participantType: creatorType },
      ...participantInput.map(p => ({ participantId: p._id, participantType: p.type }))
    ];

    const existingConversation = await Conversation.findOne({
      type: 'direct',
      $and: participantIds.map(id => ({ 'participants.participantId': id })),
      participants: { $size: participantsWithTypes.length }
    }).populate('participants.participantId');

    if (existingConversation) {
      const formattedExisting = {
        ...existingConversation.toObject(),
        participants: existingConversation.participants.map(p => {
          const userDoc = p.participantId;
          return {
            _id: userDoc._id,
            firstName: userDoc.personal?.firstName || userDoc.name,
            lastName: userDoc.personal?.lastName || '',
            email: userDoc.personal?.email || userDoc.email,
            participantType: p.participantType
          };
        })
      };
      return { existing: true, conversation: formattedExisting };
    }

    const newConversation = new Conversation({
      participants: participantsWithTypes,
      type: 'direct'
    });
    await newConversation.save();

    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate('participants.participantId');

    const formattedNew = {
      ...populatedConversation.toObject(),
      participants: populatedConversation.participants.map(p => {
        const userDoc = p.participantId;
        return {
          _id: userDoc._id,
          firstName: userDoc.personal?.firstName || userDoc.name,
          lastName: userDoc.personal?.lastName || '',
          email: userDoc.personal?.email || userDoc.email,
          participantType: p.participantType
        };
      })
    };

    return { existing: false, conversation: formattedNew };
  }

  async searchCommunities(queryStr) {
    const searchRegex = new RegExp(queryStr, 'i');
    return await Community.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    })
      .populate('creator', 'personal.firstName personal.lastName')
      .populate('members', 'personal.firstName personal.lastName')
      .limit(10);
  }

  async sendJoinRequest(communityId, userId, userType, user) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    if (community.members.some(id => id.toString() === userId.toString())) {
      throw new ApiError(400, 'Already a member of this community');
    }

    if (community.pendingJoinRequests &&
      community.pendingJoinRequests.some(request =>
        request.user.toString() === userId.toString() &&
        request.status === 'pending'
      )) {
      throw new ApiError(400, 'You already have a pending join request');
    }

    if (!community.pendingJoinRequests) {
      community.pendingJoinRequests = [];
    }

    community.pendingJoinRequests.push({
      user: userId,
      userType: userType || 'Student',
      status: 'pending',
      createdAt: new Date()
    });

    await community.save();
    return community;
  }

  async acceptJoinRequest(communityId, userId, adminId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    if (community.creator.toString() !== adminId.toString() && !community.admins.includes(adminId)) {
      throw new ApiError(403, 'Only admins can accept join requests');
    }

    if (!community.pendingJoinRequests.some(req => req.user.toString() === userId)) {
      throw new ApiError(400, 'No pending join request found for this user');
    }

    community.pendingJoinRequests = community.pendingJoinRequests.filter(req => req.user.toString() !== userId);
    community.members.push(userId);
    await community.save();

    await Student.findByIdAndUpdate(userId, {
      $addToSet: { community: communityId }
    });

    return community;
  }

  async rejectJoinRequest(communityId, userId, adminId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    if (community.creator.toString() !== adminId.toString() && !community.admins.includes(adminId)) {
      throw new ApiError(403, 'Only admins can reject join requests');
    }

    if (!community.pendingJoinRequests.some(req => req.user.toString() === userId)) {
      throw new ApiError(400, 'No pending join request found for this user');
    }

    community.pendingJoinRequests = community.pendingJoinRequests.filter(req => req.user.toString() !== userId);
    await community.save();

    return community;
  }

  async getJoinRequests(userId) {
    const communities = await Community.find({
      $or: [
        { creator: userId },
        { admins: userId }
      ]
    }).select('_id name');

    if (!communities.length) {
      return [];
    }

    const joinRequests = await Community.find({
      _id: { $in: communities.map(c => c._id) },
      pendingJoinRequests: { $exists: true, $ne: [] }
    })
      .populate('pendingJoinRequests.user', 'personal.firstName personal.lastName email')
      .select('name pendingJoinRequests');

    return joinRequests.flatMap(community =>
      community.pendingJoinRequests.map(req => ({
        _id: req._id,
        community: {
          _id: community._id,
          name: community.name
        },
        user: {
          _id: req.user?._id || null,
          name: req.user ? `${req.user.personal?.firstName || ''} ${req.user.personal?.lastName || ''}`.trim() : 'Unknown User',
          email: req.user?.email || ''
        },
        requestedAt: req.createdAt
      }))
    );
  }

  async markMessagesAsRead(conversationId, userId, role) {
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        status: { $in: ['sent', 'delivered'] }
      },
      { $set: { status: 'read' } }
    );

    const userModel = role === 'admin' ? Admin : role === 'teacher' ? Teacher : Student;
    await userModel.findByIdAndUpdate(userId, {
      $set: {
        'messageHistory.$[elem].status': 'read'
      }
    }, {
      arrayFilters: [
        { 'elem.conversationId': conversationId, 'elem.status': { $in: ['sent', 'delivered'] } }
      ]
    });

    return result.modifiedCount;
  }
}

export default new MessageService();
