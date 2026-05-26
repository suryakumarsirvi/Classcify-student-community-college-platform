import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "@/contexts/AuthContext";

const SOCKET_URL = "http://localhost:5000";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) {
      console.warn("⚠️ No user ID found for socket authentication");
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem("studentToken") ||
          localStorage.getItem("teacherToken") ||
          localStorage.getItem("adminToken")
      }
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected");
      // Authenticate user
      newSocket.emit("authenticate", user._id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user?._id]);

  return socket;
};

export default useSocket;
