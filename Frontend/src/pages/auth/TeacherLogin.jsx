import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from 'sonner';
import api from '@/api/axios';

export default function TeacherLogin() {
  const [formData, setFormData] = useState({ uid: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Loading...");

    try {
      const { data } = await api.post('/api/teachers/login', formData);
      
      localStorage.setItem('teacherToken', data.token);
      toast.success('Teacher login successful!🎉');
      navigate('/teacher/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Staff Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white p-8 rounded-lg shadow-xl cursor-grab">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Teacher Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="uid">Staff UID</Label>
          <Input 
            id="uid" 
            placeholder="Enter your UID"
            value={formData.uid}
            onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
