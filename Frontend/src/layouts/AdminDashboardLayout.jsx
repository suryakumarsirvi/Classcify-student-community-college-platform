import { useState, useEffect } from "react";
import AdminSidebar from "@/components/Common/AdminSidebar";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate } from "react-router-dom";

const AdminDashboardLayout = () => {
  // Get initial state from localStorage or default to true
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem('adminSidebarExpanded');
    // Only use saved state if it exists and is "false", otherwise default to true
    return savedState === "false" ? false : true;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarExpanded', isSidebarExpanded);
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen">
      <AdminSidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "pl-64" : "pl-20",
        )}
      >
        <main className="p-4">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
