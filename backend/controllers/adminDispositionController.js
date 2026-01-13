import DispositionMaster from "../models/DispositionMaster.js";

/* ===============================
   GET ALL DISPOSITIONS
=============================== */
export const getDispositions = async (req, res) => {
  const list = await DispositionMaster.find().sort({ order: 1 });
  res.json({ success: true, data: list });
};

/* ===============================
   CREATE
=============================== */
export const createDisposition = async (req, res) => {
  const disposition = await DispositionMaster.create(req.body);
  res.json({ success: true, data: disposition });
};

/* ===============================
   UPDATE
=============================== */
export const updateDisposition = async (req, res) => {
  const disposition = await DispositionMaster.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({ success: true, data: disposition });
};

/* ===============================
   ENABLE / DISABLE
=============================== */
export const toggleDisposition = async (req, res) => {
  const disposition = await DispositionMaster.findById(req.params.id);
  disposition.active = !disposition.active;
  await disposition.save();

  res.json({ success: true, data: disposition });
};
