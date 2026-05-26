// components/InvitationsList.jsx
import React, { useEffect, useState } from 'react';
import { CommunityAPI } from '@/api/message.api';

const InvitationsList = () => {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    CommunityAPI.getUserInvitations()
      .then(setInvitations)
      .catch(console.error);
  }, []);

  const handleAccept = async (invitationId) => {
    try {
      await CommunityAPI.acceptInvite(invitationId);
      setInvitations(prev => prev.filter(i => i._id !== invitationId));
    } catch (error) {
      console.error('Accept error:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Pending Invitations</h3>
      {invitations.map(invite => (
        <div key={invite._id} className="flex justify-between items-center mb-2">
          <span>{invite.community.name}</span>
          <Button 
            size="sm"
            onClick={() => handleAccept(invite._id)}
          >
            Accept
          </Button>
        </div>
      ))}
    </div>
  );
};

export default InvitationsList;