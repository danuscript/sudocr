import './App.css';
import React, { useRef, useState } from 'react';

function App() {
  const videoRef = useRef(null);
  const flipRef = useRef(null);
  const snapRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
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
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  async function flipVideo() {
    try {
      if (stream && stream.active) {
        var tracks = stream.getVideoTracks();
        tracks.forEach((track) => {
          track.stop();
        })
      }

      const video = videoRef.current;
      video.srcObject = null;

      constraints.video.facingMode = constraints.video.facingMode === 'environment' ? 'user' : 'environment';
      await getMedia(constraints);
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

      const track = videoRef.current.srcObject.getTracks()[0];
      track.stop();
      setVideoStarted(false);
    }
  }

  return (
    <>
      <div className="App">
        <div className="header"><h1>sudORC</h1></div>
        <div style={{ width: '100%' }}>
          <video
            className="video"
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ display: videoStarted ? 'block' : 'none' }}
          />
          <canvas className="canvas" ref={canvasRef} style={{ display: 'none' }} />
          <div className='imageWrapper' style={{ display: videoStarted ? 'none' : 'flex' }} >
            <img className='image' ref={imageRef} alt={'screen capture'} />
          </div>
        </div>
        <button className="flip" onClick={flipVideo} ref={flipRef} style={{ display: videoStarted ? 'block' : 'none' }}>flip</button>
        <button className="snap" ref={snapRef} onClick={snap} style={{ display: videoStarted ? 'block' : 'none' }}>snap</button>
        <div className="footer">
          <button className="upload">upload</button>
          <button className="take-pic" onClick={getMedia}>
            take pic
          </button>
        </div>
      </div>

    </>
  );
}

export default App;
