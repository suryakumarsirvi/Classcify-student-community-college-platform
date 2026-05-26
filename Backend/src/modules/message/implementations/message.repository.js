import Community from '../../../database/models/community.model.js';
import Invitation from '../../../database/models/invitation.model.js';
import Conversation from '../../../database/models/conversation.model.js';
import Message from '../../../database/models/message.model.js';
import MessageRepositoryContract from '../contracts/message.repository.contract.js';

class MessageRepository extends MessageRepositoryContract {
  async findCommunityById(id) {
    return await Community.findById(id).populate('creator members pendingJoinRequests');
  }

  async findCommunitiesByUser(userId) {
    return await Community.find({
      $or: [
        { members: userId },
        { creator: userId }
      ]
    })
      .populate('creator', 'name college course')
      .populate('members', 'name')
      .sort({ createdAt: -1 });
  }

  async createCommunity(communityData) {
    const community = new Community(communityData);
    return await community.save();
  }

  async findInvitationById(id) {
    return await Invitation.findById(id).populate('community');
  }

  async findPendingInvitation(communityId, recipientId) {
    return await Invitation.findOne({
      community: communityId,
      recipient: recipientId,
      status: 'pending'
    });
  }

  async createInvitation(invitationData) {
    return await Invitation.create(invitationData);
  }

  async deleteInvitation(id) {
    return await Invitation.findByIdAndDelete(id);
  }

  async findConversationById(id) {
    return await Conversation.findById(id);
  }

  async findDirectConversation(participantIds) {
    return await Conversation.findOne({
      type: 'direct',
      $and: participantIds.map(id => ({ 'participants.participantId': id })),
      participants: { $size: participantIds.length }
    }).populate('participants.participantId');
  }

  async createConversation(conversationData) {
    const conversation = new Conversation(conversationData);
    return await conversation.save();
  }

  async saveMessage(messageData) {
    const message = new Message({
      sender: messageData.senderId,
      senderType: messageData.senderType,
      receiver: messageData.receiverId,
      receiverType: messageData.receiverType || 'Student',
      community: messageData.communityId,
      conversation: messageData.conversationId,
      content: messageData.content,
      status: 'sent',
      createdAt: new Date()
    });

    const savedMessage = await message.save();

    const conversation = await Conversation.findById(messageData.conversationId);
    if (conversation) {
      conversation.lastMessage = savedMessage._id;
      conversation.lastMessageSender = messageData.senderId;
      conversation.lastMessageSenderType = messageData.senderType;
      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    return savedMessage;
  }

  async getMessagesByConversation(conversationId) {
    return await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
  }

  async getDirectMessages(senderId, receiverId) {
    return await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).populate('sender', 'personal.firstName personal.lastName');
  }

  async getCommunityMessages(communityId) {
    return await Message.find({ community: communityId })
      .populate('sender', 'personal.firstName personal.lastName')
      .sort({ createdAt: 1 });
  }

  async getUserConversations(userId) {
    return await Conversation.find({
      'participants.participantId': userId
    })
      .populate('participants.participantId')
      .populate('community', 'name image')
      .populate('lastMessageSender');
  }
}

export default new MessageRepository();
