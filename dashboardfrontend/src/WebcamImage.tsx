import { useEffect, useRef, useState } from 'react';
import { SingleDataProps } from './types';
import { formatDate } from './utils';

const WebcamImage = ({ data: imageData }: SingleDataProps<string>) => {
  const [ timestamp, setTimestamp ] = useState<number>(0);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageData.timestamp > 0) {
      if (!!image.current) {
        image.current.src = imageData.data;
      }
      setTimestamp(imageData.timestamp);
    }
  }, [imageData]);

  return (
    <section className='card mb-4 d-flex flex-column align-items-center shadow-sm'>
      <img className='card-img-top' ref={ image } alt='Webcam' style={{ width: '320px', height: '240px' }} />
      <div className='card-body'>
        { timestamp > 0 &&  (<p className='card-text'>Timestamp: { formatDate(new Date(timestamp)) }</p>) }
      </div>
    </section>
  )
};

export default WebcamImage;