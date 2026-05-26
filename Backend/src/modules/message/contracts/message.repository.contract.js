class MessageRepositoryContract {
  async findCommunityById(id) { throw new Error('Method not implemented'); }
  async findCommunitiesByUser(userId) { throw new Error('Method not implemented'); }
  async createCommunity(communityData) { throw new Error('Method not implemented'); }
  async findInvitationById(id) { throw new Error('Method not implemented'); }
  async findPendingInvitation(communityId, recipientId) { throw new Error('Method not implemented'); }
  async createInvitation(invitationData) { throw new Error('Method not implemented'); }
  async deleteInvitation(id) { throw new Error('Method not implemented'); }
  async findConversationById(id) { throw new Error('Method not implemented'); }
  async findDirectConversation(participants) { throw new Error('Method not implemented'); }
  async createConversation(conversationData) { throw new Error('Method not implemented'); }
  async saveMessage(messageData) { throw new Error('Method not implemented'); }
  async getMessagesByConversation(conversationId) { throw new Error('Method not implemented'); }
  async getDirectMessages(senderId, receiverId) { throw new Error('Method not implemented'); }
  async getCommunityMessages(communityId) { throw new Error('Method not implemented'); }
  async getUserConversations(userId) { throw new Error('Method not implemented'); }
}

export default MessageRepositoryContract;
