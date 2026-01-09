import React from "react";

const ContactCardSmall = ({ contact, onSelect }) => (
  <div
    className="p-2 border rounded mb-2 cursor-pointer hover:bg-blue-50"
    onClick={onSelect}
  >
    <div className="font-medium">{contact.fullName}</div>
    <div className="text-sm text-gray-600">{contact.mobile}</div>
    <div className="text-xs text-gray-500">{contact.categories?.join(", ")}</div>
  </div>
);

export default ContactCardSmall;
