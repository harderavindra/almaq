import React, { useState, useRef } from "react";
import api from "../../api/axios";
import MobileSearchInput from "./MobileSearchInput";
import InputText from "../../components/common/InputText";
import SelectDropdown from "../../components/common/SelectDropdown";
import Button from "../../components/common/Button";
import LocationDropdowns from "../../components/common/LocationDropdowns";

const VisitorFormPage = ({ onDone }) => {
  const purposeRef = useRef(null);

  const initialFormState = {
    firstName: "",
    lastName: "",
    fullName: "",
    mobile: "",
    idProofType: "",
    idProofNumber: "",
    purpose: "",
    toMeet: "",
    visitType: "walk-in",
    remarks: "",
    contactId: null,
    location: {},
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // HANDLE SAVE
  // -----------------------------
  const handleSave = async () => {
    setSubmitting(true);

    const payload = {
      contactId: formData.contactId || null,
      mobile: formData.mobile,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: formData.fullName,
      idProofType: formData.idProofType,
      idProofNumber: formData.idProofNumber,
      purpose: formData.purpose,
      toMeet: formData.toMeet,
      visitType: formData.visitType,
      remarks: formData.remarks,
      locationId: formData.location.locationId,
      address: formData.location,
    };

    try {
      await api.post("/visitors", payload);

      // Notify parent about success
      if (typeof onDone === "function") {
        onDone("Visitor added successfully");
      }

      setFormData(initialFormState);

    } catch (err) {
      console.error(err);

      // Notify parent about failure
      if (typeof onDone === "function") {
        onDone(null, "Failed to save visitor");
      }

    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // AUTO-FILL FROM CONTACT
  // -----------------------------
  const autofillFromContact = (contact) => {
    setFormData((prev) => ({
      ...prev,
      contactId: contact._id,
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      fullName: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
      mobile: contact.mobile,
      location: {
        state: contact.address?.state || "",
        district: contact.address?.district || "",
        taluka: contact.address?.taluka || "",
        city: contact.address?.city || "",
      },
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">

      <h2 className="text-2xl font-bold mb-6">Visitor Entry</h2>

      {/* MOBILE SEARCH */}
      <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
      <MobileSearchInput
        onSelectContact={autofillFromContact}
        onNewMobile={(num) =>
          setFormData((prev) => ({
            ...prev,
            mobile: num,
            contactId: null,
          }))
        }
        onDone={() => purposeRef.current?.focus()}
      />

      {/* FIRST NAME / LAST NAME */}
      <div className="grid grid-cols-2 gap-8 mt-6">
        <InputText
          label="First Name"
          value={formData.firstName}
          handleOnChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              firstName: e.target.value,
              fullName: `${e.target.value} ${prev.lastName}`.trim(),
            }))
          }
        />

        <InputText
          label="Last Name"
          value={formData.lastName}
          handleOnChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              lastName: e.target.value,
              fullName: `${prev.firstName} ${e.target.value}`.trim(),
            }))
          }
        />
      </div>

      {/* LOCATION */}
      <div className="mt-4">
        <LocationDropdowns
          listStyle="grid"
          gap="32"
          defaultState={formData.location?.state}
          defaultDistrict={formData.location?.district}
          defaultTaluka={formData.location?.taluka}
          defaultCity={formData.location?.city}
          onChange={(loc) =>
            setFormData((prev) => ({ ...prev, location: { ...loc } }))
          }
        />
      </div>

      {/* OTHER FIELDS */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <SelectDropdown
          label="Visit Type"
          value={formData.visitType}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, visitType: e.target.value }))
          }
          options={[
            { label: "Walk-in", value: "walk-in" },
            { label: "Scheduled", value: "scheduled" },
          ]}
        />

        <InputText
          ref={purposeRef}
          label="Purpose of Visit"
          value={formData.purpose || ""}
          handleOnChange={(e) =>
            setFormData((prev) => ({ ...prev, purpose: e.target.value }))
          }
        />

        <InputText
          label="To Meet"
          value={formData.toMeet || ""}
          handleOnChange={(e) =>
            setFormData((prev) => ({ ...prev, toMeet: e.target.value }))
          }
        />

        <SelectDropdown
          label="ID Proof Type"
          value={formData.idProofType || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, idProofType: e.target.value }))
          }
          options={[
            { label: "Aadhar Card", value: "aadhar" },
            { label: "PAN Card", value: "pan" },
            { label: "Driving License", value: "dl" },
            { label: "Voter ID", value: "voter" },
          ]}
        />

        <InputText
          label="ID Proof Number"
          value={formData.idProofNumber || ""}
          handleOnChange={(e) =>
            setFormData((prev) => ({ ...prev, idProofNumber: e.target.value }))
          }
        />
      </div>

      {/* REMARKS */}
      <InputText
        label="Remarks"
        value={formData.remarks || ""}
        textarea
        handleOnChange={(e) =>
          setFormData((prev) => ({ ...prev, remarks: e.target.value }))
        }
        className="mt-4"
      />

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-6">
        <Button disabled={submitting} onClick={handleSave}>
          {submitting ? "Saving..." : "Save Visitor"}
        </Button>
      </div>
      
    </div>
  );
};

export default VisitorFormPage;
