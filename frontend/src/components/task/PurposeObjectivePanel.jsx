const PurposeObjectivePanel = ({ purpose }) => (
  <div className="bg-gray-100 p-6 rounded-xl space-y-2">
    <h3 className="font-medium">
      {purpose?.title || "Purpose & Objective"}
    </h3>

    <div
      dangerouslySetInnerHTML={{
        __html: purpose?.summary || "—",
      }}
    />

    {purpose?.agentGoal && (
      <div className="text-xs text-gray-500">
        Agent Goal: {purpose.agentGoal}
      </div>
    )}
  </div>
);
export default PurposeObjectivePanel;