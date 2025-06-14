import React, { useEffect, useState } from "react";
import StatusMessage from "./StatusMessage";
import { FiRefreshCcw } from "react-icons/fi";

const StatusMessageWrapper = ({ loading, success, error, editSections, className }) => {
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className={className}>
        <StatusMessage variant="progress">
          <div className="flex items-center">
            <FiRefreshCcw className="animate-spin mr-2" /> Loading...
          </div>
        </StatusMessage>
      </div>
    );
  }

  if (success && !Object.values(editSections || {}).some(Boolean) && showSuccess) {
    return (
      <div className={className}>
        <StatusMessage variant="success">{success}</StatusMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <StatusMessage variant="failure">{error}</StatusMessage>
      </div>
    );
  }

  return null;
};

export default StatusMessageWrapper;
