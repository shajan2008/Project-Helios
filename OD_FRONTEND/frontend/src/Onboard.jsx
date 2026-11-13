import { useEffect, useRef, useState } from 'react';
import { analyze } from './ml';
import { api } from './api';

const Report = ({ result }) =>
  result && (
    <div className="chk">
      {result.checks.map((check, index) => (
        <div key={index} className={check[1] ? 'p' : 'f'}>
          {check[1] ? '✔' : '✖'} {check[0]}
        </div>
      ))}
      {!result.ok && (
        <div className="f">Retake in better light and hold steady.</div>
      )}
    </div>
  );

export default function Onboard({ onDone, onSkip }) {
  const [photo, setPhoto] = useState({});
  const [document, setDocument] = useState({});
  const [documentType, setDocumentType] = useState('');
  const [camera, setCamera] = useState(null);
  const [liveChecks, setLiveChecks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef();
  const fileRef = useRef();
  const targetRef = useRef();
  const streamRef = useRef();

  const getAnalysisKind = (target) => (target === 'p' ? 'face' : 'doc');

  const saveAnalyzedImage = async (target, blob, url, source) => {
    const result = await analyze(source, getAnalysisKind(target));
    const update = target === 'p' ? setPhoto : setDocument;

    update({ blob, url, result });
  };

  const handleFile = (event) => {
    const selectedFile = event.target.files[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > 2e6) {
      setError('File must be under 2MB');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const image = new Image();

    image.onload = () => {
      saveAnalyzedImage(targetRef.current, selectedFile, url, image);
    };
    image.src = url;
  };

  const chooseFile = (target) => {
    targetRef.current = target;
    fileRef.current.click();
  };

  const startCamera = async (target) => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'p' ? 'user' : 'environment' },
      });
      setCamera(target);
    } catch {
      setError('Camera unavailable. Allow access or upload a file.');
    }
  };

  useEffect(() => {
    if (!camera) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    const interval = setInterval(async () => {
      if (video.videoWidth) {
        const result = await analyze(video, getAnalysisKind(camera));
        setLiveChecks(result.checks);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [camera]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCamera(null);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const target = camera;
    canvas.toBlob(
      (blob) => {
        saveAnalyzedImage(target, blob, URL.createObjectURL(blob), canvas);
        stopCamera();
      },
      'image/jpeg',
      0.85,
    );
  };

  const isComplete = photo.result?.ok && document.result?.ok && documentType;

  const submitProfile = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', photo.blob);
      formData.append('document', document.blob);
      formData.append('docType', documentType);
      onDone(await api.profile(formData));
    } catch (submitError) {
      setError(submitError.message);
    }

    setIsSubmitting(false);
  };

  const ImageSlot = ({ target, image, prompt }) =>
    image.url ? (
      <>
        <img className="pv" src={image.url} alt="" />
        <button
          className="btn o full"
          onClick={() =>
            (target === 'p' ? setPhoto : setDocument)({})
          }
        >
          Remove
        </button>
      </>
    ) : (
      <div className="drop" onClick={() => chooseFile(target)}>
        {prompt}
      </div>
    );

  return (
    <div className="lw">
      <div className="ob card">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 34 }}>📋</div>
          <h2>Complete your Profile</h2>
          <div className="mut">
            Upload your photo and identity document to get started
          </div>
        </div>

        <div className="stp">
          <span className="on">① Photo</span>
          <span className={photo.url ? 'on' : ''}>② Document</span>
          <span className={isComplete ? 'on' : ''}>③ Submit</span>
        </div>

        <label>PASSPORT-SIZE PHOTO</label>
        <ImageSlot
          target="p"
          image={photo}
          prompt="📷 Drop your photo here or click to browse (JPG, PNG, max 2MB)"
        />
        <Report result={photo.result} />

        <button className="btn o full" onClick={() => startCamera('p')}>
          📹 {photo.url ? 'Retake with' : 'Use'} camera
        </button>

        <label>IDENTITY DOCUMENT</label>
        <select
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
        >
          <option value="">Select document type...</option>
          {['College ID card', 'Aadhaar', 'Passport', 'Driving licence'].map(
            (type) => (
              <option key={type}>{type}</option>
            ),
          )}
        </select>

        <div style={{ marginTop: 10 }}>
          <ImageSlot
            target="d"
            image={document}
            prompt="Click to attach document (JPG/PNG)"
          />
        </div>
        <Report result={document.result} />

        <button className="btn o full" onClick={() => startCamera('d')}>
          📹 Scan document with camera
        </button>

        {camera && (
          <div>
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="chk">
              {liveChecks.map((check, index) => (
                <div key={index} className={check[1] ? 'p' : 'f'}>
                  {check[1] ? '✔' : '✖'} {check[0]}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn full" onClick={captureImage}>
                Capture
              </button>
              <button className="btn o" onClick={stopCamera}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
        <div className="err">{error}</div>
        <button
          className="btn full"
          disabled={!isComplete || isSubmitting}
          onClick={submitProfile}
        >
          {isSubmitting ? 'Uploading…' : 'Submit & open dashboard'}
        </button>
        {onSkip && (
          <button
            className="btn o full"
            style={{ marginTop: 10 }}
            onClick={onSkip}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
