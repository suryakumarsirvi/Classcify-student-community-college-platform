import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import postApi from "@/api/post.api";

const CreateButton = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ caption: "", tags: "" });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "video/*": [".mp4", ".mov"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!file) {
      alert("No file selected!");
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("media", file); // Make sure this is correct
      formPayload.append("caption", formData.caption);
      formPayload.append("tags", formData.tags);

      console.log("🟢 Sending FormData:");
      for (let [key, value] of formPayload.entries()) {
        console.log(key, value);
      }

      await postApi.createPost(formPayload);
      // alert("Post created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("🔴 Error creating post:", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog> 
      <DialogTrigger asChild>
        <div className="fixed z-50 cursor-pointer bottom-5 right-5 h-14 w-14 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#2c1bb6] transition">
          <Plus />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create New Post
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {preview
              ? (
                <div className="relative">
                  {file.type.startsWith("video/")
                    ? (
                      <video
                        src={preview}
                        className="max-h-64 mx-auto"
                        controls
                      />
                    )
                    : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto"
                      />
                    )}
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 h-8 w-8 rounded-full"
                    variant="destructive"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )
              : <p>Drag & drop or click to upload (image or video)</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              value={formData.caption}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })}
              placeholder="Add a caption..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateButton;
