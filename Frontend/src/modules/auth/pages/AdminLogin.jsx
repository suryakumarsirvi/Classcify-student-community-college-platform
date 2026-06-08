import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router";

export default function AdminAuth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isLogin ? "Logging in..." : "Creating admin account... ⏳");

    try {
      const endpoint = isLogin ? "/api/admin/login" : "/api/admin/init";
      const res = await api.post(endpoint, formData);

      if (!res.data.token && isLogin) {
        throw new Error("No token received from server");
      }

      // Defer toast operations to next event loop to avoid render-phase updates
      setTimeout(() => {
        toast.dismiss(toastId);
        toast.success(
          isLogin ? "Login successful! 🎉" : "Admin Created Successfully! ✅"
        );

        if (isLogin) {
          localStorage.setItem("adminToken", res.data.token);
          toast.info("Redirecting to dashboard... 🚀");
          setTimeout(() => {
            navigate("/admin/dashboard", { replace: true });
          }, 1500);
        } else {
          setIsLogin(true);
        }
      }, 0);
    } catch (err) {
      // Defer toast operations to next event loop to avoid render-phase updates
      setTimeout(() => {
        toast.dismiss(toastId);
        const errorMessage =
          err?.originalError?.response?.data?.msg ||
          err?.originalError?.response?.data?.error ||
          err?.message ||
          "Something went wrong!";
        toast.error(`❌ Error: ${errorMessage}`);
        setLoading(false);
      }, 0);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cursor-grab">
      <Toaster position="top-right" />
      <form
        onSubmit={handleSubmit}
        className="w-96 space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-center">
            {isLogin ? "Admin Login" : "Admin Sign-Up"}
          </h2>

          <div>
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email2"
              type="email"
              placeholder="admin@classcify.edu.in"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password2"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
        </Button>

        <p className="text-center text-sm mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-500 cursor-pointer hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}
