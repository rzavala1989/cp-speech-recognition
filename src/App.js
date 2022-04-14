import MicRecorder from 'mic-recorder-to-mp3';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ASSEMBLY_AI_API_KEY } from './utils/keys';

const assembly = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: ASSEMBLY_AI_API_KEY,
    'content-type': 'application/json',
  },
});

assembly
  .post('/transcript', {
    audio_url: 'https://bit.ly/3yxKEIY',
  })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));

function App() {
  //using mic recorder
  const recorder = useRef(null);
  const audioPlayer = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [blob, setBlob] = useState(null);
  //are we recording?
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedURL, setUploadedURL] = useState('');

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  //to upload audio file once its recorded
  useEffect(() => {
    audioFile &&
      assembly.post('/upload', audioFile).then((res) => {
        setUploadedURL(res.data.upload_url);
      });
    console.log(uploadedURL);
  }, [audioFile]);

  const startRecording = () => {
    //to make sure that we have browser support
    recorder.current.start().then(() => {
      setIsRecording(true);
    });
  };

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, 'audio.mp3', {
          type: blob.type,
          lastModified: Date.now(),
        });
        const newBlob = URL.createObjectURL(blob);
        setBlob(newBlob);
        setIsRecording(false);
        setAudioFile(file);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className='flex flex-col items-center justify-center my-10 space-y-5'>
      <h1 className='text-3xl'>React Spech Recognition App</h1>
      <h3 className='text-2xl'>
        Brought to you by:{' '}
        <a
          className='text-secondary animate-pulse'
          href='https://assemblyai.com'
          target='_blank'
          rel='noreferrer'
        >
          AssemblyAI
        </a>
      </h3>
      <audio ref={audioPlayer} src={blob} controls='controls' />
      <div>
        <button
          disabled={isRecording}
          onClick={startRecording}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Record
        </button>
        <button
          disabled={!isRecording}
          onClick={stopRecording}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
        >
          Stop
        </button>
        <button className='bg-pink-300 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded'>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
