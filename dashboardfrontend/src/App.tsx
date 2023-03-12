import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { io, Socket } from 'socket.io-client';
import { Data, Status } from './types';
import { merge } from './utils';
import {CategoryScale} from 'chart.js'; 
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);

const formatDigit = (digit: number): string => {
  return ('0' + digit).slice(-2);
}

const formatDate = (date: Date): string => {
  return formatDigit(date.getHours()) + ':' + formatDigit(date.getMinutes()) + ':' + formatDigit(date.getSeconds());
};

interface DataProps<T> {
  data: Data<T>[]
};

const WebcamImages = ({ data }: DataProps<string>) => {
  const [ index, setIndex ] = useState<number>(0);
  const [ timestamp, setTimestamp ] = useState<number>(0);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (data.length >= 1) {
      setIndex(data.length - 1);
    }
  }, [data]);

  useEffect(() => {
    if (data.length >= 1) {
      const currentData = data[index];
      if (!!image.current) {
        image.current.src = currentData.data;
      }
      setTimestamp(currentData.timestamp);
    }
  }, [data, index]);

  const updateIndex = (change: number) => {
    if (index + change >= 0 && index + change <= data.length - 1) {
      setIndex(index => index + change);
    }
  };

  const canUpdate = (change: number): boolean => {
    return (index + change >= 0 && index + change <= data.length - 1)
  };

  return (
    <div>
      <p>Images Available: { data.length }, at: { index + 1 }</p>
      <img ref={ image } alt='Webcam' />
      <div>
        <button onClick={ () => updateIndex(-1) } disabled={ !!!canUpdate(-1) }>Prev</button>
        <span>Timestamp: { formatDate(new Date(timestamp)) }</span>
        <button onClick={ () => updateIndex(+1) }  disabled={ !!!canUpdate(+1) }>Next</button>
      </div>
    </div>
  )
};

const TemperatureChart = ({ data }: DataProps<number>) => {
  return (
    <div style={{height:'200px', width:'320px'}}>
      <Line
        data={{ 
          labels: data.map(d => formatDate(new Date(d.timestamp))), 
          datasets: [{ 
            label: 'Temperatures', 
            data: data.map(d => d.data),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }] 
        }} />
    </div>
  );
};

const App = () => {
  const [ socket ] = useState<Socket>(io('http://hagenpc.fritz.box:8082'));
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const [ images, setImages ] = useState<Data<string>[]>([]);
  const [ temperatures, setTemperatures ] = useState<Data<number>[]>([]);

  useEffect(() => {
    const handleStatusUpdate = (status: Status) => {
      if (images.length === 0 || (images.slice(-1)[0].timestamp < status.webcam.timestamp)) {
        setImages(images => merge(images, status.webcam));
      }

      if (temperatures.length === 0 || (temperatures.slice(-1)[0].timestamp < status.temperature.timestamp)) {
        setTemperatures(temperatures => merge(temperatures, status.temperature, 100));
      }
    };

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('status', status => handleStatusUpdate(status));

    return () => {
      socket.off('connect', () => setIsConnected(false));
      socket.off('disconnect', () => setIsConnected(false));
      socket.off('status');
    };
  }, [socket, images, temperatures]);

  return (
    <div>
      { isConnected && <div>
        <WebcamImages data={ images } />
        <TemperatureChart data={ temperatures } />
      </div> }
      { !!!isConnected && <p>Is not Connected</p> }
    </div>
  );
};

export default App;
