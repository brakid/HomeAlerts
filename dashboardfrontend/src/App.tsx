import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { InternalState, Status } from './types';
import { merge } from './utils';
import WebcamImage from './WebcamImage';
import TemperatureChart from './TemperatureChart';
import IsAtHomeComponent from './IsAtHomeComponent';

const App = () => {
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const [ internalState, setInternalState ] = useState<InternalState>({ 
    image: { data: '', timestamp: 0 },
    temperatures: [],
    isAtHome: { data: false, timestamp: 0 }
  });

  useEffect(() => {
    const socket = io('http://hagenpc.fritz.box:8082');

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
    <div>
      { isConnected && <div>
        <WebcamImage data={ internalState.image } />
        <TemperatureChart data={ internalState.temperatures } />
        <IsAtHomeComponent data={ internalState.isAtHome } />
      </div> }
      { !!!isConnected && <p>Is not Connected</p> }
    </div>
  );
};

export default App;
