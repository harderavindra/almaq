import { useState } from "react";
import { createContact } from "../../api/contactApi";

const ContactCreate = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    category: "",
    source: "manual",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContact(form);
      alert("Contact created!");
      window.location.href = "/contacts";
    } catch (err) {
      alert("Error creating contact");
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Add Contact</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          placeholder="First Name"
          required
          onChange={handleChange}
        />

        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
        />

        <input
          name="mobile"
          placeholder="Mobile"
          required
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          onChange={handleChange}
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default ContactCreate;
