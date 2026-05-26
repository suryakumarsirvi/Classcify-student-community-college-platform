import { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  BarChart as BarChartIcon,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Download,
  Edit,
  Filter,
  LineChart as LineChartIcon,
  MoreVertical,
  Plus,
  Sliders,
  Trash,
  User,
  Users,
  GraduationCap,
  Book,
  Clock,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminAnalytics = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [analyticsData, setAnalyticsData] = useState({
    stats: [],
    attendance: [],
    performance: [],
    subjectDistribution: [],
    teacherPerformance: []
  });
  const [tableData, setTableData] = useState([
    {
      id: 1,
      name: "Monthly Performance Report",
      category: "Performance",
      date: "2024-04-16",
      status: "active"
    },
    {
      id: 2,
      name: "Attendance Analysis",
      category: "Attendance",
      date: "2024-04-15",
      status: "active"
    },
    {
      id: 3,
      name: "Teacher Evaluation",
      category: "Teachers",
      date: "2024-04-14",
      status: "completed"
    },
    {
      id: 4,
      name: "Student Progress",
      category: "Students",
      date: "2024-04-13",
      status: "active"
    }
  ]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: new Date(),
    status: "active",
  });

  // Configure axios
  axios.defaults.baseURL = 'http://localhost:5000';
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        // Mock data for demonstration
        const mockData = {
          stats: [
            { title: "Total Students", value: "1,245", change: "+12%", icon: Users },
            { title: "Active Classes", value: "45", change: "+5%", icon: BookOpen },
            { title: "Average Attendance", value: "92%", change: "+3%", icon: CheckCircle },
            { title: "Assignments Completed", value: "1,856", change: "+8%", icon: ClipboardList }
          ],
          attendance: [
            { name: "Mon", present: 95, absent: 5 },
            { name: "Tue", present: 92, absent: 8 },
            { name: "Wed", present: 90, absent: 10 },
            { name: "Thu", present: 94, absent: 6 },
            { name: "Fri", present: 96, absent: 4 }
          ],
          performance: [
            { name: "Jan", score: 75 },
            { name: "Feb", score: 82 },
            { name: "Mar", score: 78 },
            { name: "Apr", score: 85 },
            { name: "May", score: 88 }
          ],
          subjectDistribution: [
            { name: "Mathematics", value: 30 },
            { name: "Science", value: 25 },
            { name: "English", value: 20 },
            { name: "History", value: 15 },
            { name: "Computer", value: 10 }
          ],
          teacherPerformance: [
            { name: "Rahul Sharma", rating: 4.8, students: 45 },
            { name: "Priya Patel", rating: 4.9, students: 50 },
            { name: "Amit Kumar", rating: 4.7, students: 42 },
            { name: "Sneha Gupta", rating: 4.6, students: 38 }
          ]
        };
        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update existing report
        await axios.put(`/api/admin/analytics/reports/${formData.id}`, formData);
      } else {
        // Create new report
        await axios.post('/api/admin/analytics/reports', formData);
      }
      
      // Refresh reports data
      const reportsRes = await axios.get('/api/admin/analytics/reports');
      setTableData(reportsRes.data);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/analytics/reports/${id}`);
      
      // Refresh reports data
      const reportsRes = await axios.get('/api/admin/analytics/reports');
      setTableData(reportsRes.data);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <stat.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={stat.change.startsWith("+") ? "success" : "destructive"}>
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Student attendance trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.attendance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Average student performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.performance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#2563eb" name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Student enrollment by subject</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.subjectDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Teacher Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Performance</CardTitle>
            <CardDescription>Teacher ratings and student count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.teacherPerformance.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.students} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{teacher.rating}/5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analytics Reports</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {formData.id ? "Edit" : "Create"} Report
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date</Label>
                    <CalendarPicker
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "active"
                        ? "default"
                        : "secondary"}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of 5
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === 5}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Storage Usage</Label>
                <span className="text-sm text-muted-foreground">78% used</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>API Response Time</Label>
                <span className="text-sm text-muted-foreground">320ms avg</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">New user registration</h4>
                  <p className="text-sm text-muted-foreground">
                    2 hours ago - User #2345 registered
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
