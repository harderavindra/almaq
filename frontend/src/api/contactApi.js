import api from "./axios";

// CREATE CONTACT
export const createContact = async (data) => {
  const res = await api.post("/contacts", data);
  return res.data;
};

// GET ALL CONTACTS
export const getContacts = async (params = {}) => {
  const res = await api.get("/contacts", { params });
  return res.data;
};

// GET SINGLE CONTACT
export const getContact = async (id) => {
  const res = await api.get(`/contacts/${id}`);
  return res.data;
};

// UPDATE CONTACT
export const updateContact = async (id, data) => {
  const res = await api.put(`/contacts/${id}`, data);
  return res.data;
};

// DELETE CONTACT (soft delete)
export const deleteContact = async (id) => {
  const res = await api.delete(`/contacts/${id}`);
  return res.data;
};
