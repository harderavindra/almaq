import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import InputText from "../../components/common/InputText";
import SelectDropdown from "../../components/common/SelectDropdown";
import Button from "../../components/common/Button";
import LocationDropdowns from "../../components/common/LocationDropdowns";
import api from "../../api/axios";

const ContactFormPanel = ({ contactId, onSave, onClose, mode }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when adding new
  useEffect(() => {
    if (mode === "add") setFormData({});
  }, [mode]);

  // -------------------------------
  // FETCH CONTACT DIRECTLY (EDIT MODE ONLY)
  // -------------------------------
  useEffect(() => {
    if (mode !== "edit" || !contactId) return;

    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/contacts/${contactId}`);
        const c = res.data.data;

        setFormData({
          ...c,
          categories: c.categories || [],
          tags: c.tags || [],
          preferredLanguage: c.preferredLanguage || "marathi",

          // Flatten address object
          state: c.address?.state || "",
          district: c.address?.district || "",
          taluka: c.address?.taluka || "",
          city: c.address?.city || "",
          addressLine: c.address?.addressLine || "",
          pincode: c.address?.pincode || "",
        });
      } catch (err) {
        console.error("Failed to load contact", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId, mode]);

  //--------------------------
  // Generic input handler
  //--------------------------
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // -------------------------------
  // Safe address update
  // -------------------------------
  const safeSetLocation = (loc) => {
    setFormData((prev) => ({
      ...prev,
      state: loc.state,
      district: loc.district,
      taluka: loc.taluka,
      city: loc.city,
    }));
  };

  // -------------------------------
  // TAGS HANDLER
  // -------------------------------
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (!tag) return;
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      e.target.value = "";
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // -------------------------------
  // SAVE
  // -------------------------------
  const handleSave = () => {
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      altMobile: formData.altMobile,
      email: formData.email,
      preferredLanguage: formData.preferredLanguage,
      categories: formData.categories || [],
      tags: formData.tags || [],
      doNotDisturb: formData.doNotDisturb,

      address: {
        state: formData.state,
        district: formData.district,
        taluka: formData.taluka,
        city: formData.city,
        addressLine: formData.addressLine,
        pincode: formData.pincode,
      },
    };

    onSave(payload, contactId);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="h-full overflow-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-md text-gray-400 font-semibold">
          {mode === "add" ? "Add New Contact" : "Edit Contact"}
        </h2>
        <button onClick={onClose}>
          <FiX size={26} className="text-gray-600 hover:text-black" />
        </button>
      </div>

      <div className="space-y-6">

        {/* BASIC INFO */}
          <InputText size="sm" label="Mobile" value={formData.mobile || ""} handleOnChange={handleChange("mobile")} />
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <InputText size="sm" label="First Name" value={formData.firstName || ""} handleOnChange={handleChange("firstName")} />
          <InputText size="sm" label="Last Name" value={formData.lastName || ""} handleOnChange={handleChange("lastName")} />

          <InputText size="sm" label="Alternate Mobile" value={formData.altMobile || ""} handleOnChange={handleChange("altMobile")} />

          <InputText size="sm" label="Email" value={formData.email || ""} handleOnChange={handleChange("email")} />
          <SelectDropdown
          label="Category"
          value={formData.categories?.[0] || ""}
          options={[
            { label: "Citizen", value: "citizen" },
            { label: "Farmer", value: "farmer" },
            { label: "Visitor", value: "visitor" },
            { label: "Customer", value: "customer" },
          ]}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categories: [e.target.value] }))
          }
        />
        </div>

         {/* LOCATION */}
        <LocationDropdowns
            listStyle="grid"
            size={"sm"}
          defaultState={formData.state}
          defaultDistrict={formData.district}
          defaultTaluka={formData.taluka}
          defaultCity={formData.city}
          onChange={safeSetLocation}
        />
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">


        <InputText label="Address Line" value={formData.addressLine || ""} handleOnChange={handleChange("addressLine")} />
        <InputText label="Pincode" value={formData.pincode || ""} handleOnChange={handleChange("pincode")} />
</div>

        {/* CATEGORY */}
        

        {/* TAGS */}
        <div>
          <label className="block mb-1 font-medium">Tags</label>
          <input
            type="text"
            placeholder="Press Enter to add tag"
            className="border w-full p-2 rounded"
            onKeyDown={handleTagKeyDown}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map((tag, i) => (
              <div key={i} className="bg-blue-100 px-2 py-1 rounded flex items-center gap-1 text-sm">
                {tag}
                <button onClick={() => removeTag(tag)}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Language */}
        <SelectDropdown
          label="Preferred Language"
          value={formData.preferredLanguage || "marathi"}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, preferredLanguage: e.target.value }))
          }
          options={[
            { label: "Marathi", value: "marathi" },
            { label: "Hindi", value: "hindi" },
            { label: "English", value: "english" },
          ]}
        />

        {/* DND */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.doNotDisturb || false}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, doNotDisturb: e.target.checked }))
            }
          />
          <label>Do Not Disturb (DND)</label>
        </div>

       
        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave}>{mode === "add" ? "Create Contact" : "Update Contact"}</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactFormPanel;
