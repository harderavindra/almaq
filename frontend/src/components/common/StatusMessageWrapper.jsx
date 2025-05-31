import React from "react";
import StatusMessage from "./StatusMessage"; // Ensure correct import
import { FiRefreshCcw } from "react-icons/fi";

const StatusMessageWrapper = ({ loading, success, error, editSections, className }) => {
  if (loading) {
    return (
      <div className={className}>
        <StatusMessage variant="progress">{className}
          <div className="flex items-center"> <FiRefreshCcw className="animate-spin mr-2" /> Loading..</div>
        </StatusMessage>
      </div>
    );
  }

  if (success && !Object.values(editSections || {}).some(Boolean)) {
    return (
      <div className={className}>
        <StatusMessage variant="success">
          {success}
        </StatusMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
      <StatusMessage variant="failure">
        {error}
      </StatusMessage>
      </div>
    );
  }

  return null;
};

export default StatusMessageWrapper;
