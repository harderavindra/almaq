import React from "react";
import { FiPlus, FiEdit2, FiPhone, FiMail, FiCheck, FiClock, FiX, FiTrash } from "react-icons/fi";
import { BiSolidBadge } from "react-icons/bi";
const ContactList = ({ contacts, onView, onEdit, onAdd }) => {
    return (
        <div className="p-5">

            {/* HEADER SECTION */}
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold">Contacts</h2>

                <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                    onClick={onAdd}
                >
                    <FiPlus /> Add Contact
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-auto ">


                <div className="flex flex-col gap-4">
                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center p-5 text-gray-500">
                                No contacts found
                            </td>
                        </tr>
                    )}

                    {contacts.map((contact) => (
                        <div className="flex justify-center items-center gap-4 cursor-pointer border border-gray-100 rounded-lg px-4 py-2 bg-white"
                            key={contact._id}

                            onClick={() => onView(contact)}
                        >
                            <div className="w-10 h-10 rounded-full bg-amber-200 justify-center items-center flex uppercase text-black/60 font-bold">
                                {`${contact.firstName?.charAt(0) ?? ""}${contact.lastName?.charAt(0) ?? ""}`}
                            </div>
                            <div className="flex justify-between w-full">
                            <div className="flex justify-center items-center  gap-1">
                                <div className="flex gap-2 min-w-[200px]">
                                    <h2 className="font-semibold text-lg capitalize">   {contact.firstName} {contact.lastName}</h2>
                                    <div className="w-6 h-6 relative">
                                        <BiSolidBadge color={  contact.status === "active"  ? "#22c55e"  : contact.status === "inactive"  ? "#ef4444"  : "#a3a3a3"} size={22} />
                                     <span className="absolute -top-[1px] -left-[1px] w-full h-full flex justify-center items-center"> {  contact.status === "active"  ? <FiCheck color="#fff" size={12}/>  : contact.status === "inactive"  ? <FiClock/>  : <FiX/>}</span>
                                     
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <p className="flex gap-2 items-center text-gray-600 min-w-[12   0px]"><FiPhone />{contact.mobile}</p>
                                    <p className="flex gap-2 justify-center items-center text-gray-600"><FiMail />{contact.email}</p>
                                </div>
                            </div>

                        

                            {/* Actions: Edit button (Stop propagation to avoid triggering onView) */}
                            <div className="p-3 text-right flex gap-3">
                                <button
                                    className="text-gray-600 hover:text-blue-800 border-2 border-gray-400 h-8 w-8 rounded-full flex justify-center items-center"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevents row click event
                                        onEdit(contact);
                                    }}
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                   <button
                                    className="text-gray-600 hover:text-blue-800 border-2 border-gray-400 h-8 w-8 rounded-full flex justify-center items-center"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevents row click event
                                        onEdit(contact);
                                    }}
                                >
                                    <FiTrash size={14} />
                                </button>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactList;
