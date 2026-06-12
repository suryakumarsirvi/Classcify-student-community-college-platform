import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "@/contexts/AuthContext";

const SOCKET_URL = "http://localhost:5000";
let globalSocket = null;

const useSocket = () => {
  const [socket, setSocket] = useState(globalSocket);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setSocket(null);
      }
      return;
    }

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        withCredentials: true,
        auth: {
          token: localStorage.getItem("studentToken") ||
            localStorage.getItem("teacherToken") ||
            localStorage.getItem("adminToken")
        }
      });

      globalSocket.on("connect", () => {
        console.log("🔌 Global Socket connected");
        globalSocket.emit("authenticate", user._id);
      });

      globalSocket.on("disconnect", () => {
        console.log("🔌 Global Socket disconnected");
      });
    }

    setSocket(globalSocket);
  }, [user?._id]);

  return socket;
};

export default useSocket;
