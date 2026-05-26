import TeacherSidebar from "@/components/Common/TeacherSidebar";
import { cn } from "@/lib/utils";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const TeacherDashboardLayout = () => {
  // Get initial state from localStorage or default to true
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem('teacherSidebarExpanded');
    // Only use saved state if it exists and is "false", otherwise default to true
    return savedState === "false" ? false : true;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('teacherSidebarExpanded', isSidebarExpanded);
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen">
      <TeacherSidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "pl-64" : "pl-20",
        )}
      >
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
