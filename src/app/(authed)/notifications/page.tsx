"use client";

const NOTIFICATIONS = [
  { unread: true, cat: "Approval needed", body: "£485.00 quote awaiting your approval — EICR at 14 Exmouth Market", time: "28 min ago" },
  { unread: true, cat: "Engineer on site", body: "Marcus R. arrived at Flat 4, 52 Marylebone Lane for JOB-2481", time: "3 min ago" },
  { unread: true, cat: "Report uploaded", body: "Completion report ready for JOB-2474 · Blocked drain", time: "1h 12m ago" },
  { unread: false, cat: "Invoice issued", body: "FX-INV-4421 · £280.00 · Post-tenancy clean at Crawford Street", time: "Today · 09:02" },
  { unread: false, cat: "Compliance due", body: "EICR at 14 Exmouth Market expires in 21 days", time: "Yesterday · 11:05" },
  { unread: false, cat: "Quote approved", body: "£620.00 quote approved for glazing at Pelham Place by Priya Nair", time: "Yesterday · 16:40" },
  { unread: false, cat: "Job scheduled", body: "Glazing replacement scheduled for 25 Apr · 10:00 at Pelham Place", time: "Yesterday · 08:14" },
  { unread: false, cat: "Message received", body: "Sasha Patel (Core Drainage): \"Booked for Friday morning, will call ahead\"", time: "2 days ago" },
];

export default function NotificationsPage() {
  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-hdr">
        <div>
          <div className="kicker">Admin</div>
          <h1>Notifications</h1>
          <p className="sub">Every update that needs your attention, in one place. Configure alert preferences in Settings.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm">Mark all read</button>
          <button className="btn btn-ghost btn-sm">Preferences</button>
        </div>
      </div>

      <div className="block">
        <div className="tbl-toolbar">
          <span className="filter-chip active">All <span className="v">{NOTIFICATIONS.length}</span></span>
          <span className="filter-chip">Unread <span className="v">3</span></span>
          <span className="filter-chip">Approvals</span>
          <span className="filter-chip">Jobs</span>
          <span className="filter-chip">Compliance</span>
          <span className="filter-chip">Finance</span>
        </div>
        <div>
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className={`notif-item${n.unread ? " unread" : ""}`}>
              <div style={{ flex: 1 }}>
                <div className="body">
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 4 }}>{n.cat}</div>
                  <div className="ln" style={{ fontSize: 13, color: "var(--ink)" }}>{n.body}</div>
                  <div className="m" style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 2, fontFamily: "var(--mono)" }}>{n.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
