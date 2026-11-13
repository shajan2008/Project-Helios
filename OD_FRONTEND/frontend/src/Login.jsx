import { useEffect, useState } from 'react';
import { api } from './api';
import srmLogo from './assets/srm-logo.jpg';

const Logo = () => (
  <svg width="160" height="52" viewBox="0 0 160 52">
    <image
      href={srmLogo}
      x="4"
      y="6"
      width="50"
      height="40"
      preserveAspectRatio="xMidYMid slice"
    />
    <text
      x="52"
      y="36"
      fontFamily="Georgia,serif"
      fontSize="34"
      fontWeight="700"
      fill="#1e3a8a"
    >
      SRM
    </text>
    <text x="52" y="47" fontFamily="sans-serif" fontSize="5.5" fill="#1e3a8a">
      INSTITUTE OF SCIENCE &amp; TECHNOLOGY
    </text>
  </svg>
);

const ROLES = {
  student: 'Student',
  mentor: 'Mentor',
  hod: 'HOD',
};

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [netid, setNetid] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCaptcha = () => {
    setCaptchaAnswer('');
    api
      .captcha()
      .then(setCaptcha)
      .catch(() => setError('Cannot reach server. Is the backend running on :8080?'));
  };

  useEffect(loadCaptcha, []);

  const handleLogin = async () => {
    setError('');

    if (!netid || !otp) {
      return setError('Enter NetID and OTP.');
    }

    try {
      const user = await api.login({
        role,
        netid,
        otp,
        captchaId: captcha.id,
        captchaAnswer,
      });

      onLogin(user);
    } catch (loginError) {
      setError(loginError.message);
      loadCaptcha();
    }
  };

  const handleResendOtp = () => {
    api.otp(netid).then(() => setMessage('OTP sent (demo OTP: 123456)'));
  };

  return (
    <div className="lw">
      <div className="login card">
        <div className="lp">
          <Logo />
          <h2>Dear Student,</h2>
          <p>Welcome to SRMIST OD TRACK PORTAL.</p>
          <p>
            You can access this portal to submit on-duty (OD) requests, track
            approval status from mentors, and view official event activity
            records.
          </p>
          <p>
            SRMIST students can login with NetID credentials (i.e. if your mail
            ID is abcd@srmist.edu.in, your netid is abcd).
          </p>
        </div>

        <div className="rp">
          <div className="pt">Student OD Portal</div>
          <div className="pb">
            <div className="tabs">
              {Object.keys(ROLES).map((currentRole) => (
                <button
                  key={currentRole}
                  className={currentRole === role ? 'on' : ''}
                  onClick={() => setRole(currentRole)}
                >
                  {ROLES[currentRole]}
                </button>
              ))}
            </div>

            <label>NetID (without '@srmist.edu.in')</label>
            <input
              value={netid}
              onChange={(event) => setNetid(event.target.value)}
              placeholder="Enter NetID"
              autoComplete="username"
            />

            <label>ENTER YOUR OTP</label>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              inputMode="numeric"
            />

            <label>CAPTCHA</label>
            <div className="cap">
              <img src={captcha.image} alt="captcha" width="120" height="44" />
              <button
                className="btn o"
                onClick={loadCaptcha}
                aria-label="Refresh captcha"
              >
                ↻
              </button>
              <input
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                placeholder="Type the code"
              />
            </div>

            <div className="row">
              <label className="rm">
                <input type="checkbox" />
                Remember me
              </label>
              <a onClick={handleResendOtp}>Resend OTP?</a>
            </div>

            <div className="err">{error || message}</div>
            <button className="btn full" onClick={handleLogin}>
              Sign in as {ROLES[role]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
