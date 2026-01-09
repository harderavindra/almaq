import React, { useEffect, useState } from "react";
import ContactList from "./ContactList";
import ContactViewPanel from "./ContactViewPanel";
import ContactFormPanel from "./ContactFormPanel";
import api from "../../api/axios";

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [panelMode, setPanelMode] = useState(""); // "view" | "edit" | "add"

    const fetchContacts = async () => {
        const res = await api.get("/contacts");
        setContacts(res.data.data);
        console.log()
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const onView = (contact) => {
        setSelectedContact(contact);
        setPanelMode("view");
    };

    const onAdd = () => {
        setFormData({});
        setPanelMode("add");
    };

    const onEdit = (contact) => {
        setSelectedContactId(contact._id);
        setPanelMode("edit");
    };

    const closePanel = () => {
        setPanelMode("");
        setSelectedContact(null);
        setFormData({});
    };

    const onSave = async (payload, id) => {
        if (id) {
            await api.put(`/contacts/${id}`, payload);
        } else {
            await api.post(`/contacts`, payload);
        }

        closePanel();
        fetchContacts();
    };

    return (
        <div className="flex w-full gap-15">

            <div className={`transition-all duration-300 ${panelMode ? "w-1/2" : "w-full"}`}>
                <ContactList
                    contacts={contacts}
                    onView={onView}
                    onEdit={onEdit}
                    onAdd={onAdd}
                />
            </div>

            <div className={ ` rounded-2xl max-w-2xl px-10 py-0 bg-white shadow-lg transition-all duration-300
        ${panelMode ? "w-1/2 visible" : "w-0 invisible"}`}>

                {panelMode === "view" && (
                    <ContactViewPanel contact={selectedContact} onClose={closePanel} />
                )}

                {(panelMode === "add" || panelMode === "edit") && (
                    <ContactFormPanel
                        mode={panelMode}
                        contactId={selectedContactId}
                        onSave={onSave}
                        onClose={closePanel}
                    />
                )}
            </div>
        </div>
    );
};

export default ContactsPage;
