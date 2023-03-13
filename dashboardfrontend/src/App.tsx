import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { InternalState, Status } from './types';
import { merge } from './utils';
import WebcamImage from './WebcamImage';
import TemperatureChart from './TemperatureChart';
import IsAtHomeComponent from './IsAtHomeComponent';
import { FaBell } from 'react-icons/fa'

const backendUrl = process.env.REACT_APP_BACKEND || '';

const App = () => {
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const [ internalState, setInternalState ] = useState<InternalState>({ 
    image: { data: '', timestamp: 0 },
    temperatures: [],
    isAtHome: { data: false, timestamp: 0 }
  });

  useEffect(() => {
    const socket = io(backendUrl);

    const handleStateUpdate = (status: Status) => {
      setInternalState(internalState => {
        const newInternalState = Object.assign({}, internalState);
        if (internalState.image.timestamp < status.webcam.timestamp) {
          newInternalState.image = status.webcam;
        }
    
        if (internalState.temperatures.length === 0 || internalState.temperatures.slice(-1)[0].timestamp < status.temperature.timestamp) {
          newInternalState.temperatures = merge(internalState.temperatures, status.temperature, 100);
        }
    
        if (internalState.isAtHome.timestamp < status.isAtHome.timestamp) {
          newInternalState.isAtHome = status.isAtHome;
        }
        return newInternalState;
      });
    };

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('status', status => handleStateUpdate(status));

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
        <WebcamImage data={ internalState.image } />
        <TemperatureChart data={ internalState.temperatures } />
        <IsAtHomeComponent data={ internalState.isAtHome } />
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
