import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Status } from './types';
import WebcamImage from './WebcamImage';
import TemperatureChart from './TemperatureChart';
import IsAtHomeComponent from './IsAtHomeComponent';
import { FaBell } from 'react-icons/fa'

const backendUrl = process.env.REACT_APP_BACKEND || '';

const App = () => {
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const [ status, setStatus ] = useState<Status>({ 
    webcam: { data: '', timestamp: 0 },
    webcam2: { data: '', timestamp: 0 },
    temperatures: [],
    isAtHome: { data: false, timestamp: 0 }
  });

  useEffect(() => {
    const socket = io(backendUrl);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('status', newStatus => setStatus(newStatus));

    return () => {
      socket.off('connect', () => setIsConnected(false));
      socket.off('disconnect', () => setIsConnected(false));
      socket.off('status');
    };
  }, []);

  return (
    <div className='container-sm d-flex flex-column align-items-center'>
      <div className='row mb-4 d-flex flex-column align-items-center'>
        <h1>HomeAlerts</h1>
        <FaBell />
        <h2>Monitoring Dashboard</h2>
      </div>
      { isConnected && <div className='mb-4'>
        <WebcamImage data={ status.webcam } />
        <WebcamImage data={ status.webcam2 } />
        <TemperatureChart data={ status.temperatures } />
        <IsAtHomeComponent data={ status.isAtHome } />
      </div> }
      { !!!isConnected && <div className='alert alert-danger' role={ 'alert' }>Not connected to the dashboard backend</div> }
      <div className='row mb-4 d-flex flex-column align-items-center'>
        <a className='text-muted' href='https://www.hagen-schupp.me'>Hagen Schupp</a>
        <p className='text-muted'>&copy; 2023</p>
      </div>
    </div>
  );
};

export default App;
