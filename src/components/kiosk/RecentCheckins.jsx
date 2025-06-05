import React from 'react';

const RecentCheckins = ({ recentCheckins }) => {
  return (
    <aside className="recent-checkins">
      <h3>Recent Check-ins</h3>
      {recentCheckins.length > 0 ? (
        <ul className="checkin-list">
          {recentCheckins.map((checkin) => (
            <li
              key={checkin.id}
              className={`checkin-item ${checkin.status.toLowerCase()}`}
            >
              <span className="checkin-name">{checkin.name}</span>
              <div className="checkin-details">
                <span className="checkin-time">{checkin.time}</span>
                <span className="checkin-status">
                  {checkin.status === "LATE"
                    ? `Late (${checkin.lateMinutes} min)`
                    : "Present"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-checkins">No recent check-ins</p>
      )}
    </aside>
  );
};

export default RecentCheckins;