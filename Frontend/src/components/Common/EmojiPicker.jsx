import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const EmojiPicker = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      {/* Emoji Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
      >
        😀
      </button>

      {/* Emoji Picker Popup */}
      {showPicker && (
        <div className="absolute bottom-12 left-0 z-50 shadow-lg">
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              onSelect(emoji.native); // emoji.native is the actual emoji
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
