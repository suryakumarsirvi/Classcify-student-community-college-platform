import StudentSidebar from "@/components/Common/StudentSidebar";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const StudentDashboardLayout = () => {
  // Get initial state from localStorage or default to true
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem('studentSidebarExpanded');
    // Only use saved state if it exists and is "false", otherwise default to true
    return savedState === "false" ? false : true;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studentSidebarExpanded', isSidebarExpanded);
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen">
      <StudentSidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "pl-64" : "pl-20",
        )}
      >
        <main className="px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
