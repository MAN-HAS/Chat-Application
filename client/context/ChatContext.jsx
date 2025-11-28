import { useEffect } from "react";
import { useContext, useState } from "react";
import { createContext } from "react";
import { toast } from "react-hot-toast";

import { AuthContext } from "./AuthContext";




export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages,setMessages] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedUser,setSelectedUser] = useState(null);
    const [unseenMessages,setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);

    //function to get all users for Sidebar
    const getUsers = async ()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected user

    const getMessages = async (userId)=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
                //  CLEAR UNSEEN COUNT HERE
                setUnseenMessages(prev => ({
                  ...prev,
                [userId]: 0}));
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user

    const sendMessage = async(messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,
            messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }



    useEffect(() => {
        if (!socket) return;
      
        const handler = async (newMessage) => {
          const isChatOpen =
            selectedUser &&
            (newMessage.senderId === selectedUser._id ||
             newMessage.receiverId === selectedUser._id);
      
          if (isChatOpen) {
            setMessages(prev => [...prev, newMessage]);
            await axios.put(`/api/messages/mark/${newMessage._id}`);
          } else {
            setUnseenMessages(prev => ({
              ...prev,
              [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
            }));
          }
        };
      
        socket.on("newMessage", handler);
      
        return () => socket.off("newMessage", handler);
      }, [socket, selectedUser]);
      



    const value = {
        messages, users, selectedUser, getUsers, getMessages, 
        sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }



    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}