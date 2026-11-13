import { useEffect, useState } from 'react';
import { api } from './api';

const LABELS = {
  PM: 'Pending Mentor',
  PH: 'Pending HOD',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const NAVIGATION = {
  student: [
    ['dash', 'Dashboard'],
    ['new', 'New OD Request'],
    ['my', 'My Requests'],
  ],
  mentor: [
    ['dash', 'Dashboard'],
    ['pend', 'Pending Reviews'],
  ],
  hod: [
    ['dash', 'Dashboard'],
    ['pend', 'Department Requests'],
  ],
};

const Stat = ({ label, value }) => (
  <div className="card st">
    <small>{label}</small>
    <b>{value}</b>
  </div>
);

const Table = ({ rows, action, staff }) => (
  <div className="bx">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Event</th>
          <th>Type</th>
          <th>Dates</th>
          <th>Status</th>
          {action && <th />}
        </tr>
      </thead>
      <tbody>
        {rows.map((request) => (
          <tr key={request.id}>
            <td>
              <b>{request.id}</b>
              {staff && (
                <>
                  <br />
                  <small>
                    {request.studentName} · {request.dept}
                  </small>
                </>
              )}
            </td>
            <td>{request.event}</td>
            <td>{request.type}</td>
            <td>
              {request.fromDate}
              {request.toDate !== request.fromDate && ` → ${request.toDate}`}
            </td>
            <td>
              <span className={`pill ${request.status}`}>
                {LABELS[request.status]}
              </span>
            </td>
            {action && (
              <td className="nw">
                <button
                  className="btn no s"
                  onClick={() => action(request.id, 'reject')}
                >
                  Reject
                </button>{' '}
                <button
                  className="btn ok s"
                  onClick={() => action(request.id, 'approve')}
                >
                  Approve
                </button>
              </td>
            )}
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td colSpan="6">Nothing here yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

function NewForm({ pre, onDone, onErr }) {
  const [type, setType] = useState(pre.type || 'Event');
  const [form, setForm] = useState({
    event: pre.event || '',
    venue: '',
    description: '',
    fromDate: '',
    toDate: '',
  });
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const submitRequest = async () => {
    try {
      await api.create({ ...form, type });
      onDone();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="card pn">
      <label className="f0">Select OD Type</label>
      <div className="chips">
        {['Event', 'Sports', 'Workshop', 'Hackathon', 'Cultural', 'Other'].map(
          (option) => (
            <button
              key={option}
              className={option === type ? 'on' : ''}
              onClick={() => setType(option)}
            >
              {option}
            </button>
          ),
        )}
      </div>

      <div className="g2f">
        <div>
          <label>Event Name</label>
          <input
            value={form.event}
            onChange={updateField('event')}
            placeholder="e.g., Smart India Hackathon 2026"
          />
        </div>
        <div>
          <label>Venue / Location</label>
          <input
            value={form.venue}
            onChange={updateField('venue')}
            placeholder="e.g., IIT Madras Campus"
          />
        </div>
      </div>

      <label>Event Description</label>
      <textarea
        rows="4"
        value={form.description}
        onChange={updateField('description')}
        placeholder="Describe the event and your role…"
      />

      <div className="g2f">
        <div>
          <label>From Date</label>
          <input
            type="date"
            value={form.fromDate}
            onChange={updateField('fromDate')}
          />
        </div>
        <div>
          <label>To Date</label>
          <input
            type="date"
            value={form.toDate}
            onChange={updateField('toDate')}
          />
        </div>
      </div>

      <div className="err">{error}</div>
      <button className="btn" onClick={submitRequest}>
        Submit request
      </button>
    </div>
  );
}

export default function Dashboard({ user, onLogout, onVerify }) {
  const [view, setView] = useState('dash');
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [prefill, setPrefill] = useState({});
  const [toast, setToast] = useState('');

  const loadRequests = () => api.list().then(setRequests).catch(() => {});

  useEffect(() => {
    loadRequests();
  }, []);

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const reviewRequest = async (id, action) => {
    try {
      await api.review(id, action);
      flash(action === 'approve' ? 'Approved' : 'Rejected');
      loadRequests();
    } catch (requestError) {
      flash(requestError.message);
    }
  };

  const pendingStatus = user.role === 'mentor' ? 'PM' : 'PH';
  const pendingRequests = requests.filter(
    (request) => request.status === pendingStatus,
  );
  const countByStatus = (status) =>
    requests.filter((request) => request.status === status).length;
  const navigate = (nextView) => {
    setView(nextView);
    setOpen(false);
  };
  const title =
    view !== 'dash'
      ? NAVIGATION[user.role].find((item) => item[0] === view)[1]
      : user.role === 'student'
        ? `Good morning, ${user.name.split(' ')[0]} 👋`
        : user.role === 'mentor'
          ? `Welcome, ${user.name}`
          : 'Department Overview';

  let body;

  if (user.role === 'student') {
    if (view === 'new') {
      body = (
        <NewForm
          pre={prefill}
          onDone={() => {
            setPrefill({});
            flash('Request submitted to mentor');
            loadRequests();
            setView('my');
          }}
        />
      );
    } else if (view === 'my') {
      body = (
        <>
          <div className="chips mb">
            {['All', 'Pending', 'Approved', 'Rejected'].map((option) => (
              <button
                key={option}
                className={option === filter ? 'on' : ''}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="card pn">
            <Table
              rows={requests.filter(
                (request) =>
                  filter === 'All' || LABELS[request.status].includes(filter),
              )}
            />
          </div>
        </>
      );
    } else {
      body = (
        <>
          <div className="gr g4">
            <Stat label="Total Requests" value={requests.length} />
            <Stat label="Approved" value={countByStatus('APPROVED')} />
            <Stat
              label="Pending"
              value={countByStatus('PM') + countByStatus('PH')}
            />
            <Stat label="Rejected" value={countByStatus('REJECTED')} />
          </div>
          <div className="gr g2 mt">
            <div className="card pn">
              <h3>Recent Requests</h3>
              <Table rows={requests.slice(0, 5)} />
            </div>
            <div className="card pn">
              <h3>Upcoming Events</h3>
              {[
                ['PyCon Campus Meetup', 'Hackathon'],
                ['Annual Athletic Track Meet', 'Sports'],
                ['Robo Soccer Exhibition', 'Event'],
              ].map((event) => (
                <div className="ev" key={event[0]}>
                  <b>{event[0]}</b>
                  <button
                    className="btn o s"
                    onClick={() => {
                      setPrefill({ event: event[0], type: event[1] });
                      setView('new');
                    }}
                  >
                    Apply
                  </button>
                </div>
              ))}
              <button className="btn full" onClick={() => setView('new')}>
                + New OD Request
              </button>
            </div>
          </div>
        </>
      );
    }
  } else if (view === 'dash') {
    const bars = [
      ['Jul', 30],
      ['Aug', 48],
      ['Sep', 38],
      ['Oct', 70],
      ['Nov', 58],
      ['Dec', 90],
    ];

    body = (
      <>
        <div className="gr g4">
          {user.role === 'mentor' ? (
            <>
              <Stat label="Students Assigned" value={156} />
              <Stat label="Pending Reviews" value={pendingRequests.length} />
              <Stat label="Approved" value={countByStatus('APPROVED')} />
              <Stat label="Rejected" value={countByStatus('REJECTED')} />
            </>
          ) : (
            <>
              <Stat label="Total CSE Students" value={842} />
              <Stat
                label="Active OD Requests"
                value={countByStatus('PM') + countByStatus('PH')}
              />
              <Stat label="Approval Rate" value="89%" />
              <Stat label="Pending My Review" value={pendingRequests.length} />
            </>
          )}
        </div>
        <div className={`gr mt ${user.role === 'hod' ? 'g2' : ''}`}>
          <div className="card pn">
            <h3>
              {user.role === 'mentor'
                ? 'Pending Reviews'
                : 'Pending My Review (HOD Clearance)'}
            </h3>
            <Table rows={pendingRequests} action={reviewRequest} staff />
          </div>
          {user.role === 'hod' && (
            <div className="card pn">
              <h3>Monthly OD Trend</h3>
              <div className="bars">
                {bars.map((bar) => (
                  <div key={bar[0]} style={{ height: `${bar[1]}%` }}>
                    <span>{bar[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } else {
    body = (
      <div className="card pn">
        <h3>{user.role === 'hod' ? 'All department requests' : 'Requests'}</h3>
        <Table
          rows={
            user.role === 'hod'
              ? requests
              : requests.filter((request) => request.status !== 'REJECTED')
          }
          action={reviewRequest}
          staff
        />
      </div>
    );
  }

  return (
    <div className={`sh ${open ? 'open' : ''}`}>
      <aside className="sb">
        <div className="logo">
          <i>✓</i>
          ODTrack
        </div>
        {NAVIGATION[user.role].map((item) => (
          <button
            key={item[0]}
            className={`nv ${item[0] === view ? 'on' : ''}`}
            onClick={() => navigate(item[0])}
          >
            {item[1]}
          </button>
        ))}
        <button className="nv" style={{ marginTop: 20 }} onClick={onLogout}>
          Sign out
        </button>
      </aside>

      <div>
        <div className="tb">
          <button
            className="hb"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <h1>{title}</h1>
          <div className="av">
            {user.profileDone ? (
              <img src={`/api/photo/${user.netid}`} alt="" />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
        </div>
        <main className="mn">
          {user.role !== 'student' && !user.profileDone && (
            <div className="bn">
              Profile photo & ID not verified.{' '}
              <a onClick={onVerify}>Complete now</a>
            </div>
          )}
          {body}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
