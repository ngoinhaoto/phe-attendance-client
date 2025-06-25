import React from "react";

const RecentCheckins = ({ recentCheckins }) => {
  if (!recentCheckins || recentCheckins.length === 0) {
    return (
      <div className="recent-checkins">
        <h3>Recent Check-ins</h3>
        <div className="no-checkins">No check-ins recorded yet</div>
      </div>
    );
  }

  return (
    <div className="recent-checkins">
      <h3>Recent Check-ins</h3>

      {/* Table-like header */}
      <div className="checkin-header">
        <div className="checkin-header-name">Name</div>
        <div className="checkin-header-time">Time</div>
        <div className="checkin-header-status">Status</div>
      </div>

      <ul className="checkin-list">
        {recentCheckins.map((checkin, index) => (
          <li
            key={index}
            className={`checkin-item ${checkin.status?.toLowerCase() || ""}`}
          >
            <div className="checkin-name">{checkin.name}</div>
            <div className="checkin-time">
              {checkin.status.toLowerCase() === "absent" ? "—" : checkin.time}
            </div>
            <div className="checkin-status">
              {checkin.status}
              {checkin.lateMinutes > 0 && ` (${checkin.lateMinutes}m late)`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentCheckins;
