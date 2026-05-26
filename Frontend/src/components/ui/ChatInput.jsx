import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatInput = ({ newMessage, setNewMessage, sendMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() || file) {
      sendMessage(newMessage, file); // Send both text & file
      setNewMessage("");
      setFile(null); // Reset file after sending
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      {/* File Preview Card */}
      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
          <span>{file.name}</span>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 relative">
        {/* Emoji Picker Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Emoji Picker Dropdown */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-12 left-0 bg-white border shadow-md p-2 rounded-md z-50"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* File Upload Button */}
        <label className="cursor-pointer">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>

        {/* Input Field */}
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          className="flex-1 p-2 rounded-md border"
          placeholder="Type a message..."
        />

        {/* Send Button */}
        <Button onClick={handleSubmit} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
