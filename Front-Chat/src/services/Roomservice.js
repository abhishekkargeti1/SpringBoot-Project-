import { httpClient } from "../config/AxiosHelper"

export const createRoomService =async(roomDetails)=>{
    
   const response=await httpClient.post(`/api/rooms`, roomDetails,{
    headers: {
        'Content-Type': 'text/plain'
      },
   })
   return response.data
};

export const joinChatService =async(roomId)=>{
    
   const response=await httpClient.get(`/api/rooms/${roomId}`,{
    headers: {
        'Content-Type': 'text/plain'
      },
   })
   return response.data
};


export const getMessage =async(roomId,size=50,page=0)=>{
    
   const response=await httpClient.get(`/api/rooms/${roomId}/messages?size=${size}&page=${page}`,{
    headers: {
        'Content-Type': 'text/plain'
      },
   })
   return response.data
};