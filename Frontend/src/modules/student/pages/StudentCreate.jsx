import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Users,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { MessageAPI } from "@/api/message.api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const StudentCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await MessageAPI.createCommunity(formData);
      toast.success(`Study Group "${data.name}" created successfully!`);
      reset();
      setImageFile(null);
      setImagePreview(null);
      
      // Redirect to the dynamic community space
      navigate("/student/dashboard/community");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create community space.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50/50 flex flex-col items-center">
      <div className="w-full max-w-2xl px-4 space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Launch a New Space
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Create an academic club, study cohort, or interest community to connect and chat with peers.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Study Group / Community Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g. Calculus Cohort, React study group..."
                  className="pl-10 h-11"
                  {...register("name", {
                    required: "Community Name is required",
                    minLength: { value: 3, message: "Must be at least 3 characters" },
                  })}
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                Detailed Description & Target Audience
              </Label>
              <Textarea
                id="description"
                placeholder="What is this study space for? Mention weekly meeting times, subject codes, or campus goals..."
                rows={5}
                className="resize-none"
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Provide at least 10 characters description" },
                })}
              />
              {errors.description && (
                <span className="text-xs text-red-500">{errors.description.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Community Cover Picture / Banner
              </Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/30"
                }`}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <div className="relative max-w-xs mx-auto space-y-3">
                    <img
                      src={imagePreview}
                      alt="Banner Preview"
                      className="h-32 w-full object-cover rounded-lg border shadow-sm"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Cover image updated
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Drag & drop or click to choose cover
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, or JPEG (Recommended size: 800x400)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-slate-500 text-xs">
              <Globe className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <span>
                By default, new study communities are registered publicly on the campus directory. Anyone from your college can view and request to join your space.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setImageFile(null);
                  setImagePreview(null);
                }}
                disabled={submitting}
                className="h-11"
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={submitting} className="h-11 px-6">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Space...
                  </>
                ) : (
                  <>
                    Launch Cohort
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentCreate;
