const ContactViewPanel = ({ contact, onClose }) => {
  if (!contact) return null;

  return (
    <div className="p-6">daassda
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">{contact.fullName}</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <p><b>Mobile:</b> {contact.mobile}</p>
      <p><b>Email:</b> {contact.email || "-"}</p>
      <p><b>Categories:</b> {(contact.categories || []).join(", ")}</p>
      <p><b>Tags:</b> {(contact.tags || []).join(", ")}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Address</h3>
        <p>{contact.address?.addressLine}</p>
        <p>{contact.address?.city}, {contact.address?.taluka}</p>
        <p>{contact.address?.district}, {contact.address?.state}</p>
      </div>
    </div>
  );
};

export default ContactViewPanel;