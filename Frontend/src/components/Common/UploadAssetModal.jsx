import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const UploadAssetModal = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    category: "study",
    tags: "",
    isPaid: false,
    price: "",
    file: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData object
      const data = new FormData();
      
      // Append all form fields
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      data.append('isPaid', formData.isPaid);
      if (formData.isPaid) {
        data.append('price', formData.price);
      }
      data.append('file', formData.file);

      // Call the onUpload function passed from parent
      await onUpload(data);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        subject: "",
        category: "study",
        tags: "",
        isPaid: false,
        price: "",
        file: null,
      });
      
    } catch (error) {
      console.error('Error uploading asset:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Asset</DialogTitle>
          <DialogDescription>
            Share your educational resources with others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study Materials</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g. notes, programming, semester1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPaid: checked })
                }
              />
              <Label htmlFor="isPaid">Paid Asset</Label>
            </div>

            {formData.isPaid && (
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required={formData.isPaid}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files[0] })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, Word, Excel, PowerPoint, Text
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAssetModal; 