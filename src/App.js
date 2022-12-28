import './App.css';
import React, { useRef, useState } from 'react';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const [snapped, setSnapped] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  let stream = null;

  const constraints = {
    video: {
      facingMode: 'environment',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  }

  async function getMedia() {
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);

      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        setVideoStarted(true);
        setSnapped(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  async function flipVideo() {
    try {
     closeCamera();

      constraints.video.facingMode = constraints.video.facingMode === 'environment' ? 'user' : 'environment';
      await getMedia(constraints);
    } catch (err) {
      console.log(err.message);
    }
  }

  async function closeCamera() {
    try {
      if (stream && stream.active) {
        var tracks = stream.getVideoTracks();
        tracks.forEach((track) => {
          track.stop();
        })
        const video = videoRef.current;
        video.srcObject = null;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  function snap() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const image = imageRef.current;
    const context = canvas.getContext('2d');

    const height = video.videoHeight;
    const width = video.videoWidth;

    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/png');
      image.setAttribute('src', data);
      setSnapped(true);

      const track = videoRef.current.srcObject.getTracks()[0];
      track.stop();
      setVideoStarted(false);
    }
  }

  const handleUploadClick = () => {
    const fileInput = fileInputRef.current;
    fileInput.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      closeCamera();
      setVideoStarted(false);
      const dataUrl = reader.result;
      const image = imageRef.current;
      image.src = dataUrl;
      setSnapped(true);
    };
  }

  return (
    <>
      <div className="App">
        <div className="header"><h1>sudOCR</h1></div>
        <div className='wrapper'>
          <video
            className="video"
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ display: videoStarted ? 'block' : 'none' }}
          />
          <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
          <canvas className="canvas" ref={canvasRef} style={{ display: 'none' }} />
          <img className='image' ref={imageRef} alt={'screen capture'} style={{ display: snapped ? 'block' : 'none' }} />

        </div>
        <button className="flip" onClick={flipVideo} style={{ display: videoStarted ? 'block' : 'none' }}>flip</button>
        <button className="snap" onClick={snap} style={{ display: videoStarted ? 'block' : 'none' }}>snap</button>
        <div className="footer">
          <button className="upload" onClick={handleUploadClick}>upload</button>
          <button className="take-pic" onClick={getMedia}>
            take pic
          </button>
        </div>
      </div>

    </>
  );
}

export default App;
