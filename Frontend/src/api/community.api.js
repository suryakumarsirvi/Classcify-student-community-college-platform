// import api from './axios';

// const CommunityAPI = {
//     getUserCommunities: async () => {
//         try {
//             const response = await api.get('/api/communities/user');
//             return response.data;
//         } catch (error) {
//             console.error('Error fetching user communities:', error);
//             throw error;
//         }
//     },

//     createCommunity: async (data) => {
//         try {
//             const response = await api.post('/api/communities', data);
//             return response.data;
//         } catch (error) {
//             console.error('Error creating community:', error);
//             throw error;
//         }
//     },

//     joinCommunity: async (communityId) => {
//         try {
//             const response = await api.post(`/api/communities/${communityId}/join`);
//             return response.data;
//         } catch (error) {
//             console.error('Error joining community:', error);
//             throw error;
//         }
//     },

//     leaveCommunity: async (communityId) => {
//         try {
//             const response = await api.post(`/api/communities/${communityId}/leave`);
//             return response.data;
//         } catch (error) {
//             console.error('Error leaving community:', error);
//             throw error;
//         }
//     }
// };

// export default CommunityAPI; 