import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axios";

const MobileSearchInput = ({ onSelectContact, onNewMobile, onDone }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);

  const userTyping = useRef(true);

  useEffect(() => {
    if (userTyping.current && input.length === 10) {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }, [input]);

  // Fetch suggestions while typing
  useEffect(() => {
    setActiveIndex(-1);

    if (input.length === 0 || input.length === 10) {
      setSuggestions([]);
      return;
    }

    api
      .get("/contacts/search/mobile", { params: { mobile: input } })
      .then((res) => {
        setSuggestions(res.data.data || []);
      });
  }, [input]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0) {
        const selected = suggestions[activeIndex];
        setSuggestions([]);
        handleSelect(selected);
        return;
      }

      if (input.length === 10) {
        setSuggestions([]);
        onNewMobile(input);

        setTimeout(() => {
          onDone && onDone();
        }, 30);

        return;
      }
    }
  };

  const handleSelect = (contact) => {
    userTyping.current = false;

    setSuggestions([]);
    setInput(contact.mobile);

    onSelectContact(contact);

    setTimeout(() => {
      onDone && onDone();
      userTyping.current = true;
    }, 30);
  };

  return (
    <div className="bg-white border-0 shadow-[0_0_10px_0_#dadada] w-full mt-1 rounded-lg relative">
      
      {/* MOBILE INPUT */}
      <input
        type="text"
        value={input}
        maxLength={10}
        onChange={(e) => {
          const value = e.target.value;
          userTyping.current = true;
          setInput(value);
          onNewMobile(value); // ALWAYS sync with VisitorFormPage
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter mobile number"
        className="p-3 w-full focus:outline-0"
      />

      {/* SUGGESTION DROPDOWN */}
      {suggestions.length > 0 && (
        <ul className="relative max-h-48 overflow-auto z-20">
          {suggestions.map((c, i) => (
            <li
              key={c._id}
              onClick={() => handleSelect(c)}
              className={`p-3 cursor-pointer hover:bg-blue-50 ${
                activeIndex === i ? "bg-blue-100" : ""
              }`}
            >
              <div className="font-semibold">
                {c.firstName} {c.lastName}
              </div>
              <div className="text-sm text-gray-600">
                📞 {c.mobile}
                {c.address?.city ? ` • 🏙 ${c.address.city}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* VALID MOBILE CHECKMARK */}
      {input.length === 10 && suggestions.length === 0 && (
        <div className="absolute right-2 top-1 text-green-600 text-sm">
          ✔
        </div>
      )}
    </div>
  );
};

export default MobileSearchInput;
