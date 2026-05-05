export const LeadWarningBadge = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  const badgeConfig = {
    missing_phone: { text: 'Thiếu SĐT', color: 'bg-red-100 text-red-800' },
    missing_image: { text: 'Thiếu ảnh nhu cầu', color: 'bg-orange-100 text-orange-800' },
    duplicate: { text: 'Lead trùng', color: 'bg-purple-100 text-purple-800' },
    missing_source: { text: 'Thiếu source_id', color: 'bg-yellow-100 text-yellow-800' },
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {warnings.map((warning, idx) => {
        const config = badgeConfig[warning];
        if (!config) return null;
        return (
          <span key={idx} className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
            {config.text}
          </span>
        );
      })}
    </div>
  );
};
