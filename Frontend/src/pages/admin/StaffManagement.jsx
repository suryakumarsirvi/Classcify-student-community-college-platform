import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCheck,
  CheckCircle,
  ClipboardPaste,
  Copy,
  InfoIcon,
  KeyIcon,
  Loader2,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import api from "@/api/axios";
import { DialogDescription } from "@radix-ui/react-dialog";
import ConfettiExplosion from "react-confetti-explosion";
import { fireConfetti } from "@/components/Common/PartyEffect";

const Sparkles = () => (
  <div className="animate-pulse text-4xl text-yellow-500">
    ✨🎉✨
  </div>
);

const StaffManagement = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm();
  const [staff, setStaff] = useState([]);
  const [openInvite, setOpenInvite] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [openInviteSuccess, setOpenInviteSuccess] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    classroom: "",
    status: "",
  });
  const [inviteData, setInviteData] = useState({
    title: "",
    uid: "",
    description: "",
    recipientEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await api.get("/api/teachers");
        setStaff(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // Load draft data
  useEffect(() => {
    const loadDraft = async () => {
      const draftId = localStorage.getItem("teacherDraftId");
      if (draftId) {
        try {
          const { data } = await api.get(`/api/teachers/draft/${draftId}`);
          if (data) {
            reset({
              personal: data.personal,
              location: data.location,
              professional: data.professional,
            });
            setOpenAdd(true);
          }
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    };
    loadDraft();
  }, [reset]);

  const handleAddStaff = async () => {
    try {
      const draftId = localStorage.getItem("teacherDraftId");
      const { data } = await api.post("/api/teachers/send-otp", {
        draftId,
        phone: watch("professional.phone"),
      });

      if (data.success) {
        setVerificationStep(2);
        toast.success("OTP sent successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const draftId = localStorage.getItem("teacherDraftId");
      const otp = otpValues.join("");

      // Get updated teacher data from verification response
      const { data } = await api.post("/api/teachers/verify", { draftId, otp });

      // Update form with UID from backend
      setValue("professional.uid", data.teacher.professional.uid);

      // Refresh staff list
      const { data: teachers } = await api.get("/api/teachers");
      setStaff(teachers);

      localStorage.removeItem("teacherDraftId");

      setVerificationStep(3);

      toast.success("Teacher verified successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed");
    }
  };

  const saveDraft = async (formData) => {
    try {
      const draftId = localStorage.getItem("teacherDraftId");

      const payload = {
        draftId,
        data: {
          personal: formData.personal || {},
          location: formData.location || {},
          professional: formData.professional || {},
        },
      };

      const { data } = await api.post("/api/teachers/draft", payload);
      console.log(data);
      if (!draftId && data.draftId) {
        localStorage.setItem("teacherDraftId", data.draftId);
      }

      return true;
    } catch (error) {
      console.error("Save Draft Error:", error);
      toast.error(
        `Draft Save Failed: ${error.response?.data?.error || error.message}`,
      );
      return false;
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (editingTeacher) {
        if (currentStep < 3) {
          setCurrentStep((prev) => prev + 1); // Move to the next step
        } else {
          // Last step: update the staff record
          const { data } = await api.put(
            `/api/teachers/${editingTeacher._id}`,
            formData,
          );
          setStaff(staff.map((t) => t._id === editingTeacher._id ? data : t));
          toast.success("Staff updated successfully");
          setOpenAdd(false);
          setEditingTeacher(null);
          reset();
        }
      } else {
        // Existing add logic
        const success = await saveDraft(formData);
        if (success && currentStep < 3) {
          setCurrentStep((p) => p + 1);
        }
        if (success && currentStep === 3) {
          handleAddStaff();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Submission failed");
    }
  };

  const handleInviteChange = (e) => {
    setInviteData({
      ...inviteData,
      [e.target.name]: e.target.value,
    });
  };

  const sendInvitation = async () => {
    try {
      setLoading(true);
      await api.post("/api/teachers/send-invitation", inviteData);

      toast.success(`Invitation sent to ${inviteData.recipientEmail}`);
      setOpenInvite(false);
      setOpenInviteSuccess(true);
      fireConfetti();

      // Reset form
      setInviteData({
        title: "",
        uid: "",
        description: "",
        recipientEmail: "",
      });

      setTimeout(() => setOpenInviteSuccess(false), 5000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleRemoveStaff = async (id) => {
    if (
      window.confirm(
        "Do you really want to remove this user? This will permanently delete them from the database!",
      )
    ) {
      try {
        await api.delete(`/api/teachers/${id}`);
        setStaff(staff.filter((teacher) => teacher._id !== id));
        toast.success("Staff member removed successfully");
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to remove staff");
      }
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    reset({
      personal: teacher.personal,
      location: teacher.location,
      professional: teacher.professional,
    });
    setOpenAdd(true);
    setCurrentStep(1);
    setVerificationStep(0);
  };

  const filteredStaff = staff.filter((teacher) => {
    const name = (teacher.personal?.name || teacher.name || "").toLowerCase();
    const email = teacher.professional?.email || teacher.email || "";
    const phone = teacher.professional?.phone || teacher.number || "";

    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm);

    const matchesRole = !filters.role || teacher.role === filters.role;
    // Provide a fallback empty array for classrooms if undefined
    const matchesClass = !filters.classroom ||
      (teacher.classrooms || []).includes(filters.classroom);
    const matchesStatus = !filters.status || teacher.status === filters.status;

    return matchesSearch && matchesRole && matchesClass && matchesStatus;
  });

  const Step1Form = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            {...register("personal.name", { required: true })}
            placeholder="Enter teacher's name"
          />
          {errors.personal?.name && (
            <span className="text-red-500 text-sm">Required</span>
          )}
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            onValueChange={(v) => setValue("personal.gender", v)}
            value={watch("personal.gender")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Work Experience</Label>
          <Input
            type="number"
            {...register("personal.experience", { required: true })}
            placeholder="Years"
          />
        </div>
        <div className="space-y-2">
          <Label>Highest Degree</Label>
          <Input
            {...register("personal.education", { required: true })}
            placeholder="e.g. M.Sc Computer Science"
          />
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input
            type="number"
            {...register("personal.age", { required: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Select
            onValueChange={(v) => setValue("personal.maritalStatus", v)}
            value={watch("personal.maritalStatus")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="unmarried">Unmarried</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Monthly Salary</Label>
          <Input
            type="number"
            {...register("personal.salary", { required: true })}
            placeholder="₹"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          {...register("personal.termsAccepted", { required: true })}
        />
        <label htmlFor="terms" className="text-sm">
          I verify all provided information is correct
        </label>
      </div>
    </div>
  );

  const Step2Form = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input
            {...register("location.city", { required: true })}
            placeholder="Current city"
          />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input
            {...register("location.state", { required: true })}
            placeholder="State"
          />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input
            value="India"
            disabled
            {...register("location.country")}
          />
        </div>
      </div>
    </div>
  );

  const Step3Form = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            {...register("professional.email", { required: true })}
            placeholder="Professional email"
            suffix="@classcify.in"
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Number</Label>
          <Input
            type="tel"
            {...register("professional.phone", { required: true })}
            placeholder="+91 "
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assigned Classrooms</Label>
          <Select
            onValueChange={(v) => setValue("professional.classrooms", [v])}
            value={watch("professional.classrooms")?.[0]}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select classrooms" />
            </SelectTrigger>
            <SelectContent className="h-60 overflow-y-auto">
              <SelectItem value="BSC_IT">Information Technology</SelectItem>
              <SelectItem value="BSC_CS">Computer Science</SelectItem>
              <SelectItem value="BSC_MATH">Mathematics</SelectItem>
              <SelectItem value="BSC_PHY">Physics</SelectItem>
              <SelectItem value="BSC_CHEM">Chemistry</SelectItem>
              <SelectItem value="BSC_BIO">Biology</SelectItem>

              <SelectItem value="BCA">Computer Applications</SelectItem>
              <SelectItem value="BTECH_CSE">
                Computer Science & Engineering
              </SelectItem>
              <SelectItem value="BTECH_IT">Information Technology</SelectItem>
              <SelectItem value="BTECH_ECE">
                Electronics & Communication
              </SelectItem>
              <SelectItem value="BTECH_MECH">Mechanical Engineering</SelectItem>
              <SelectItem value="BTECH_CIVIL">Civil Engineering</SelectItem>

              <SelectItem value="BBA">Business Administration</SelectItem>
              <SelectItem value="BMS">Management Studies</SelectItem>
              <SelectItem value="BCOM">Commerce</SelectItem>
              <SelectItem value="BCOM_ACC">Accounting & Finance</SelectItem>
              <SelectItem value="BCOM_BFI">Banking & Insurance</SelectItem>

              <SelectItem value="BA_ECON">Economics</SelectItem>
              <SelectItem value="BA_POLSCI">Political Science</SelectItem>
              <SelectItem value="BA_SOCIO">Sociology</SelectItem>
              <SelectItem value="BA_PSY">Psychology</SelectItem>
              <SelectItem value="BA_ENG">English Literature</SelectItem>
              <SelectItem value="BA_HIST">History</SelectItem>
              <SelectItem value="BA_GEO">Geography</SelectItem>

              <SelectItem value="LLB">Law</SelectItem>
              <SelectItem value="BPHARMA">Pharmacy</SelectItem>
              <SelectItem value="MBBS">Medicine</SelectItem>
              <SelectItem value="BDS">Dentistry</SelectItem>
              <SelectItem value="BHMS">Homeopathy</SelectItem>
              <SelectItem value="BAMS">Ayurveda</SelectItem>
              <SelectItem value="BPT">Physiotherapy</SelectItem>
              <SelectItem value="BSC_NURS">Nursing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            onValueChange={(v) => setValue("professional.role", v)}
            value={watch("professional.role")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Educator">Educator</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Support Staff">Support Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {editingTeacher && (
          <div className="space-y-2">
            <Label>Unique ID</Label>
            <Input
              value={watch("professional.uid")}
              disabled
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage all teaching staff and their profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="cursor-pointer" onClick={() => setOpenAdd(true)}>
            Add New Staff
          </Button>
          <Button
            className="bg-zinc-50 text-black cursor-pointer hover:bg-zinc-50 border-2 border-zinc-400 font-bold"
            onClick={() => setOpenInvite(true)}
          >
            <Send />
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex gap-4">
        <Input
          placeholder="Search staff..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select onValueChange={(v) => setFilters({ ...filters, role: v })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="educator">Educators</SelectItem>
            <SelectItem value="supervisor">Supervisors</SelectItem>
            <SelectItem value="staff">Support Staff</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters({ ...filters, classroom: v })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Classroom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tybsc">TYBSC</SelectItem>
            <SelectItem value="sybcom">SYBCOM</SelectItem>
            <SelectItem value="cyber">Cybernet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff Table */}
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Classrooms</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unique ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>
                  {teacher.personal?.name || "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {teacher.professional?.email || "N/A"}
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Phone className="h-4 w-4" />
                    {teacher.professional?.phone || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {teacher.professional?.classrooms?.map((cls) => (
                      <Badge variant="outline" key={cls}>{cls}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {teacher.professional?.role || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={teacher.status === "verified"
                      ? "default"
                      : "destructive"}
                  >
                    {teacher.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm">
                      {teacher.professional?.uid || "Pending"}
                    </code>
                    {teacher.professional?.uid && (
                      <Button
                        variant="ghost"
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            teacher.professional?.uid,
                          );
                          setCopiedId(teacher._id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                      >
                        {copiedId === teacher._id
                          ? <CheckCheck className="h-4 w-4" />
                          : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    size="sm"
                    onClick={() => handleEditClick(teacher)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                    onClick={() => handleRemoveStaff(teacher._id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Add Staff Dialog */}
      <Dialog
        open={openAdd}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentStep(1);
            setVerificationStep(0);
            reset();
            localStorage.removeItem("teacherDraftId");
          }
          setOpenAdd(open);
        }}
      >
        <DialogContent
          className="sm:max-w-[800px]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingTeacher ? "Edit Staff Member" : "Add New Teaching Staff"}
            </DialogTitle>
            {
              /* <DialogDescription>
            </DialogDescription> */
            }
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            {verificationStep === 0 && (
              <>
                {currentStep === 1 && <Step1Form />}
                {currentStep === 2 && <Step2Form />}
                {currentStep === 3 && <Step3Form />}

                <DialogFooter>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep((p) => p - 1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : currentStep === 3
                      ? (
                        "Submit Details"
                      )
                      : (
                        "Continue"
                      )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>

          {verificationStep === 2 && (
            <div className="space-y-4 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h3 className="text-xl font-semibold">OTP Verification</h3>
              <p className="text-muted-foreground">
                Enter the 6-digit OTP sent to {watch("professional.phone")}
              </p>
              <div className="flex justify-center gap-2">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    className="w-12 text-center h-14 text-xl"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                  />
                ))}
              </div>
              <Button onClick={handleVerifyOTP} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
              </Button>
            </div>
          )}

          {verificationStep === 3 && (
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-semibold">
                Staff Added Successfully!
              </h3>
              <div className="space-y-2">
                <p>Unique Staff ID:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-xl font-mono">
                    {watch("professional.uid")}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(watch("professional.uid"))}
                  >
                    <Copy className="h-4 w-4 cursor-pointer" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setOpenAdd(false);
                  setVerificationStep(0);
                  setCurrentStep(1);
                  reset();
                }}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={openInvite} onOpenChange={setOpenInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Staff Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Title</Label>
              <Input
                name="title"
                placeholder="Welcome to ClassCity Organization!"
                value={inviteData.title}
                onChange={handleInviteChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-1">
                  {/* <KeyIcon className="h-4 w-4 text-zinc-700" /> */}
                  Unique Staff ID
                </Label>
                <span className="text-xs text-gray-500">
                  (Auto-complete enabled)
                </span>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 relative">
                  <Input
                    name="uid"
                    placeholder="Paste or select UID"
                    value={inviteData.uid}
                    onChange={handleInviteChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 100)}
                    className=""
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-800 hover:bg-zinc-200 cursor-pointer"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setInviteData((prev) => ({ ...prev, uid: text }));
                      } catch (error) {
                        toast.error("Failed to read from clipboard");
                      }
                    }}
                  >
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                </div>

                {/* Custom Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-none">
                    <div className="divide-y divide-zinc-50">
                      {staff
                        .filter((teacher) =>
                          teacher.professional?.uid?.toLowerCase().includes(
                            inviteData.uid.toLowerCase(),
                          )
                        )
                        .map((teacher) => (
                          <div
                            key={teacher._id}
                            className="px-4 py-2 hover:bg-zinc-200 cursor-pointer transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setInviteData((prev) => ({
                                ...prev,
                                uid: teacher.professional?.uid || "",
                              }));
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-900">
                                {teacher.professional?.uid}
                              </span>
                              <span className="text-sm text-zinc-500">
                                {teacher.personal?.name}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {
                  /* <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                  <InfoIcon className="h-4 w-4" />
                  Start typing to see existing UIDs or paste from clipboard
                </p> */
                }
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                name="description"
                placeholder="Add a brief description..."
                value={inviteData.description}
                onChange={handleInviteChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Send To (Email)</Label>
              <Input
                name="recipientEmail"
                placeholder="Enter recipient's email"
                value={inviteData.recipientEmail}
                onChange={handleInviteChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={sendInvitation} disabled={loading}>
              {loading
                ? <Loader2 className="animate-spin" />
                : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation Success Dialog with Celebration Effect */}
      <Dialog open={openInviteSuccess} onOpenChange={setOpenInviteSuccess}>
        <DialogContent className="text-center">
          <img
            src="https://cdn.dribbble.com/userupload/22050859/file/original-0bc2fa58763cee104c6c6092a3ae2d91.gif"
            alt="Celeb  ration GIF"
            className="mx-auto w-64"
          />
          <h3 className="text-xl font-semibold mt-4">
            HURRAY!🎉 Invitation sent successfully
          </h3>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
