import { createContext } from "react";
import axios from "axios"
import { useState } from "react";
import  toast  from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL ;
axios.defaults.baseURL = backendUrl ;

export const AuthContext = createContext();

export const AuthProvider = ( {children} )=>{

    const [token, setToken]=useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);





// check if the user is authenticated
// and if so , set the user data and connect the socket

    const checkAuth = async ()=>{
        try {
            const {data} = await axios.get("/api/auth/check")
            if (data.success){
                setAuthUser(data.user)
            }else{
                setAuthUser(null)
            }
        } catch (error) {
            toast.error(error.message)
        }finally {
            setAuthLoading(false)
        }
    }

    
//Login function to handle user authentication and socket connection
    const login = async (state,credentials)=>{
        try {
            const { data } = await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

//logout function to handle user logout and socket disconnection

    const logout = async ()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logout Successfully");
        socket?.disconnect();
        setSocket(null);
    }

//update Profile function to handle user profile updates

    const updateProfile = async(body)=>{
        try {
            const { data } = await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile Update Succesfully");
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


//connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query:{
                userId:userData._id,

            }
        })
        newSocket.connect();
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers(userIds);
        })
    }



    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
            checkAuth()
        }else{
            setAuthLoading(false)
        }
        
    },[token] )

    useEffect(() => {
        if (authUser && !socket?.connected) {
          connectSocket(authUser);
        }
      }, [authUser]);
      



    const value = {
        axios,
        authUser,
        authLoading,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
