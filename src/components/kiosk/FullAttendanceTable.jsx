import React from "react";

const FullAttendanceTable = ({ attendance }) => {
  if (!attendance || attendance.length === 0) {
    return <div className="no-attendance">No attendance records available</div>;
  }

  return (
    <div className="full-attendance">
      <div className="attendance-header">
        <div className="attendance-header-name">Name</div>
        <div className="attendance-header-time">Check-in Time</div>
        <div className="attendance-header-status">Status</div>
      </div>

      <ul className="attendance-list">
        {attendance.map((record, index) => (
          <li
            key={index}
            className={`attendance-item ${record.status?.toLowerCase() || ""}`}
          >
            <div className="attendance-name">{record.name}</div>
            <div className="attendance-time">
              {record.status === "absent" ? "—" : record.time}
            </div>
            <div className="attendance-status">
              {record.status}
              {record.lateMinutes > 0 && ` (${record.lateMinutes}m late)`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FullAttendanceTable;
