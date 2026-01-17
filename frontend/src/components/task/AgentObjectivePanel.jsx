import React from "react";

const AgentObjectivePanel = ({ purpose }) => {
  if (!purpose) return null;

  const { title, summary, agentGoal, doAndDonts } = purpose;

  return (
    <div className="border rounded-xl bg-white p-5 space-y-4">

      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold text-center">
          🎯 {title || "Objective"}
        </h3>
      </div>

      {/* SUMMARY */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="text-xs uppercase text-gray-500 mb-1">
          What you need to know
        </div>
        <div
          className="rich-content text-sm"
          dangerouslySetInnerHTML={{ __html: summary }}
        />
      </div>

      {/* AGENT GOAL */}
      {agentGoal && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs uppercase text-blue-600 mb-1">
            Your Goal
          </div>
          <div
            className="rich-content text-sm"
            dangerouslySetInnerHTML={{ __html: agentGoal }}
          />
        </div>
      )}

      {/* DO / DON'T */}
      {(doAndDonts?.do?.length || doAndDonts?.dont?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* DO */}
          {doAndDonts?.do?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-green-700 mb-2">
                ✔ Do
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {doAndDonts.do.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* DON'T */}
          {doAndDonts?.dont?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-700 mb-2">
                ✖ Don’t
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {doAndDonts.dont.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          

        </div>
      )}
    </div>
  );
};

export default AgentObjectivePanel;
