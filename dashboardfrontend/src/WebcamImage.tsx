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
    <div>
      <img ref={ image } alt='Webcam' />
      <div>
        <span>Timestamp: { formatDate(new Date(timestamp)) }</span>
      </div>
    </div>
  )
};

export default WebcamImage;