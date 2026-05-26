import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import PartyEffect from "@/components/Common/PartyEffect";
import { useLocation, useNavigate } from "react-router-dom";
import studentApi from "@/api/student.api.js";
import axios from "axios";

const StudentLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStep, setVerificationStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login & Signup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [studentId, setStudentId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("studentToken")) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const checkAuth = async () => {
      if (localStorage.getItem("studentToken")) {
        try {
          const { data } = await studentApi.getProfile({
            signal: controller.signal,
          });
          // Optionally set student profile if needed
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error("Auth check error:", error);
          }
        }
      }
    };

    checkAuth();
    return () => controller.abort();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const loginPayload = {
        personal: {
          email: formData.email.trim()
        },
        auth: {
          password: formData.password
        }
      };

      console.log("Sending login data:", loginPayload);

      const { data } = await studentApi.login(loginPayload);
      console.log("Login response:", data);

      if (data?.token) {
        localStorage.setItem("studentToken", data.token);
        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 1000);
      } else {
        console.error("Token missing in response!");
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    const formValues = watch();
    setLoading(true);
    try {
      const payload = {
        personal: {
          firstName: formValues.personal.firstName,
          middleName: formValues.personal.middleName,
          lastName: formValues.personal.lastName,
          gender: formValues.personal.gender,
          dob: formValues.personal.dob,
          maritalStatus: formValues.personal.maritalStatus,
          phone: formValues.personal.phone,
          email: formValues.personal.email,
        },
        academic: {
          collegeName: formValues.academic.collegeName,
          collegeCity: formValues.academic.collegeCity,
          state: formValues.academic.state,
          stream: formValues.academic.stream,
          course: formValues.academic.course,
          standard: formValues.academic.standard,
          admissionYear: Number(formValues.academic.admissionYear),
        },
        other: {
          interests: selectedInterests,
          personalityType: formValues.other.personalityType,
          genz: formValues.other.genz || false,
        },
        auth: {
          password: formValues.auth.password,
        },
      };

      console.log(payload);

      if (payload.other.interests.length < 1) {
        throw new Error("Select at least 1 interest");
      }

      const { data } = await studentApi.signup(payload);
      setVerificationStep(1);
      setStudentId(data.studentId);
      toast.success("OTP sent to your email!");
    } catch (error) {
      console.error("Signup Error:", error.response?.data);
      toast.error(
        error.response?.data?.error ||
          "Registration failed. Please check all fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  const interestsOptions = [
    "SPORTS",
    "GAMING",
    "MOVIES",
    "SONGS",
    "READING",
    "MEMES",
    "REELS",
    "YOUTUBE",
  ];

  const personalityTypes = [
    "Ambivert Perfectionist",
    "Choleric Achiever",
    "Melancholic Thinker",
    "Sanguine Enthusiast",
    "Phlegmatic Peacemaker",
    "Type A Extrovert",
    "Neurotic Introvert",
    "Agreeable Dreamer",
    "Conscientious Leader",
    "Skeptical Analyst",
  ];

  const handleInterestChange = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const Step1Form = () => (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input
            {...register("personal.firstName", { required: true })}
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input
            {...register("personal.middleName")}
            placeholder="Enter middle name"
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input
            {...register("personal.lastName", { required: true })}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            {...register("personal.dob", { required: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            {...register("auth.password", { required: true })}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Number</Label>
          <Input
            type="tel"
            {...register("personal.phone", {
              required: true,
              pattern: /^\+?[1-9]\d{9,13}$/,
            })}
            placeholder="+91 "
          />
        </div>
      </div>
    </div>
  );

  const Step2Form = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>College Name</Label>
          <Input
            {...register("academic.collegeName", { required: true })}
            placeholder="Enter college name"
          />
        </div>
        <div className="space-y-2">
          <Label>College City</Label>
          <Input
            {...register("academic.collegeCity", { required: true })}
            placeholder="Enter city"
          />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input
            {...register("academic.state", { required: true })}
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Stream</Label>
          <Select
            onValueChange={(v) => setValue("academic.stream", v)}
            value={watch("academic.stream")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="commerce">Commerce</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Course</Label>
          <Select
            onValueChange={(v) => setValue("academic.course", v)}
            value={watch("academic.course")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {/* Science & Technology */}
              <SelectItem value="bsc">B.Sc (Bachelor of Science)</SelectItem>
              <SelectItem value="bsc_hons">B.Sc (Hons)</SelectItem>
              <SelectItem value="btech">
                B.Tech (Bachelor of Technology)
              </SelectItem>
              <SelectItem value="bca">
                BCA (Bachelor of Computer Applications)
              </SelectItem>
              <SelectItem value="bpharma">
                B.Pharma (Bachelor of Pharmacy)
              </SelectItem>
              <SelectItem value="barch">
                B.Arch (Bachelor of Architecture)
              </SelectItem>

              {/* Commerce & Management */}
              <SelectItem value="bcom">B.Com (Bachelor of Commerce)</SelectItem>
              <SelectItem value="bcom_hons">B.Com (Hons)</SelectItem>
              <SelectItem value="bms">
                BMS (Bachelor of Management Studies)
              </SelectItem>
              <SelectItem value="bba">
                BBA (Bachelor of Business Administration)
              </SelectItem>
              <SelectItem value="bfia">
                BFIA (Bachelor of Financial Investment and Analysis)
              </SelectItem>
              <SelectItem value="baff">
                BAF (Bachelor of Accounting & Finance)
              </SelectItem>

              {/* Arts & Humanities */}
              <SelectItem value="ba">BA (Bachelor of Arts)</SelectItem>
              <SelectItem value="ba_hons">BA (Hons)</SelectItem>
              <SelectItem value="bsw">BSW (Bachelor of Social Work)</SelectItem>
              <SelectItem value="bfa">BFA (Bachelor of Fine Arts)</SelectItem>

              {/* Law */}
              <SelectItem value="llb">LLB (Bachelor of Laws)</SelectItem>
              <SelectItem value="bba_llb">
                BBA LLB (Integrated Law with Management)
              </SelectItem>
              <SelectItem value="bcom_llb">
                B.Com LLB (Integrated Law with Commerce)
              </SelectItem>

              {/* Medical & Healthcare */}
              <SelectItem value="mbbs">
                MBBS (Bachelor of Medicine & Surgery)
              </SelectItem>
              <SelectItem value="bds">
                BDS (Bachelor of Dental Surgery)
              </SelectItem>
              <SelectItem value="bhms">
                BHMS (Bachelor of Homeopathic Medicine & Surgery)
              </SelectItem>
              <SelectItem value="bams">
                BAMS (Bachelor of Ayurvedic Medicine & Surgery)
              </SelectItem>
              <SelectItem value="bpt">
                BPT (Bachelor of Physiotherapy)
              </SelectItem>
              <SelectItem value="bsc_nursing">B.Sc Nursing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Standard</Label>
          <Select
            onValueChange={(v) => setValue("academic.standard", v)}
            value={watch("academic.standard")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fy">FY</SelectItem>
              <SelectItem value="sy">SY</SelectItem>
              <SelectItem value="ty">TY</SelectItem>
              <SelectItem value="pg">PG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Admission Year</Label>
        <Input
          type="number"
          {...register("academic.admissionYear", { required: true })}
          placeholder="Enter admission year"
        />
      </div>
    </div>
  );

  const Step3Form = () => (
    <div className="grid gap-6">
      <div className="w-[500px]">
        <div className="space-y-2">
          <Label>Interested In (Select max 3)</Label>
          <div className="grid grid-cols-4 gap-2">
            {interestsOptions.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={selectedInterests.includes(interest)}
                  onCheckedChange={() =>
                    handleInterestChange(interest)}
                  disabled={selectedInterests.length >= 3 &&
                    !selectedInterests.includes(interest)}
                />
                <label htmlFor={interest} className="text-sm">
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Personality Type</Label>
          <Select
            onValueChange={(v) => setValue("other.personalityType", v)}
            value={watch("other.personalityType")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select personality type" />
            </SelectTrigger>
            <SelectContent>
              {personalityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input
          type="email"
          {...register("personal.email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          placeholder="student@example.com"
        />
        {errors.personal?.email && (
          <span className="text-red-500 text-sm">
            {errors.personal.email.message}
          </span>
        )}
      </div>
    </div>
  );

  const handleOtpChange = (e, index) => {
    let value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only allow numeric input

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;

    if (value && index < otpValues.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    setOtpValues(newOtpValues);
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    setOtpValues(pasteData.split(""));
  };

  const handleVerification = async () => {
    setLoading(true);
    try {
      const { data } = await studentApi.verify(studentId, otpValues.join(""));
      localStorage.setItem("studentToken", data.token);
      setVerificationStep(2);
      toast.success("Account verified successfully!");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = handleSubmit(async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleSignupSubmit();
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-right" />
      {showConfetti && <PartyEffect />}

      <div className="min-h-screen flex items-center justify-center cursor-grab">
        <Toaster position="top-right" />

        {isLogin
          ? (
            // 🔵 LOGIN FORM
            <form
              onSubmit={handleLogin}
              className="w-96 space-y-6 bg-white p-8 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold text-center">Student Login</h2>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password3"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Sign in"}
              </Button>

              <p className="text-center text-sm mt-4">
                Don't have an account?{" "}
                <span
                  onClick={() => setIsLogin(false)}
                  className="text-indigo-500 cursor-pointer hover:underline font-semibold"
                >
                  Sign up
                </span>
              </p>
            </form>
          )
          : (
            // 🟢 STUDENT REGISTRATION FORM
            <div className="w-[1300px] max-w-2xl bg-white p-4 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold text-center mb-8">
                Student Registration
              </h1>

              {verificationStep === 0 && (
                <form onSubmit={handleFormSubmit} className="w-full">
                  <div className="w-full mx-auto">
                    {currentStep === 1 && <Step1Form />}
                    {currentStep === 2 && <Step2Form />}
                    {currentStep === 3 && <Step3Form />}
                  </div>

                  <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCurrentStep((p) => p - 1)}
                      >
                        Back
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button type="submit" disabled={loading}>
                      {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : currentStep === 3
                        ? (
                          "Submit & Verify"
                        )
                        : (
                          "Next Step"
                        )}
                    </Button>
                  </div>
                </form>
              )}

              {verificationStep === 1 && (
                <div className="space-y-6 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <h2 className="text-2xl font-semibold">OTP Verification</h2>
                  <p className="text-muted-foreground">
                    Enter the 6-digit OTP sent to {watch("personal.email")}
                  </p>

                  <div className="flex justify-center gap-2">
                    {otpValues.map((value, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        className="w-12 text-center h-14 text-xl"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={handleOtpPaste}
                      />
                    ))}
                  </div>

                  <Button onClick={handleVerification} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>
              )}

              {verificationStep === 2 && (
                <div className="text-center space-y-6">
                  <div className="text-4xl">🎉</div>
                  <h2 className="text-2xl font-semibold">
                    Registration Successful!
                  </h2>
                  <p className="text-muted-foreground">
                    Welcome to Classcify! Your student account has been created.
                  </p>
                  <Button onClick={handleVerification}>
                    Continue to Dashboard
                  </Button>
                </div>
              )}

              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <span
                  onClick={() => setIsLogin(true)}
                  className="text-indigo-500 cursor-pointer hover:underline font-semibold"
                >
                  Login
                </span>
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default StudentLogin;
