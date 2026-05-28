import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/fileUpload.middleware.js';
import {
  createCommunity,
  getAllCommunities,
  getJoinRequests,
  getCommunityDetails,
  sendJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  sendInvitation,
  getInvitations,
  acceptInvitation,
  dismissNotification,
  sendDirectMessage,
  sendCommunityMessage,
  getDirectMessages,
  getCommunityMessages,
  getUserConversations,
  createConversation,
  getConversationMessages,
  markMessagesAsRead,
  searchCommunities
} from './message.controller.js';

const router = express.Router();

router.post('/communities', auth(['student', 'teacher', 'admin']), upload.single('image'), createCommunity);
router.get('/communities', auth(['student', 'teacher', 'admin']), getAllCommunities);
router.get('/communities/search', auth(['student', 'teacher', 'admin']), searchCommunities);
router.get('/communities/join-requests', auth(['student', 'teacher', 'admin']), getJoinRequests);
router.get('/communities/:id', auth(['student', 'teacher', 'admin']), getCommunityDetails);

router.post('/communities/:communityId/request', auth(['student', 'teacher', 'admin']), sendJoinRequest);
router.post('/communities/:communityId/request/:userId/accept', auth(['student', 'teacher', 'admin']), acceptJoinRequest);
router.post('/communities/:communityId/request/:userId/reject', auth(['student', 'teacher', 'admin']), rejectJoinRequest);

router.post('/communities/:communityId/invite', auth(['student', 'teacher', 'admin']), sendInvitation);
router.get('/invitations', auth(['student', 'teacher', 'admin']), getInvitations);
router.patch('/invitations/:invitationId/accept', auth(['student', 'teacher', 'admin']), acceptInvitation);
router.delete('/invitations/:invitationId', auth(['student', 'teacher', 'admin']), dismissNotification);

router.post('/direct', auth(['student', 'teacher', 'admin']), sendDirectMessage);
router.post('/community/:communityId', auth(['student', 'teacher', 'admin']), sendCommunityMessage);

router.get('/direct/:receiverId', auth(['student', 'teacher', 'admin']), getDirectMessages);
router.get('/community/:communityId', auth(['student', 'teacher', 'admin']), getCommunityMessages);

router.get('/conversations', auth(['student', 'teacher', 'admin']), getUserConversations);
router.post('/conversations', auth(['student', 'teacher', 'admin']), createConversation);
router.get('/conversations/:conversationId/messages', auth(['student', 'teacher', 'admin']), getConversationMessages);
router.put('/conversations/:conversationId/read', auth(['student', 'teacher', 'admin']), markMessagesAsRead);

export default router;
