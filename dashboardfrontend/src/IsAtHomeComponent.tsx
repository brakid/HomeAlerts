import { SingleDataProps } from './types';
import { formatDate } from './utils';

const IsAtHomeComponent = ({ data: isAtHomeData }: SingleDataProps<boolean>) => {
  return (
    <section className='card mb-4 d-flex flex-column align-items-center shadow-sm'>
      <div className='card-body'>
        { isAtHomeData.timestamp > 0 && (
          <>
              <p className='card-title d-flex flex-column align-items-center'>{ isAtHomeData.data ? 
              <span className='badge badge-success p-3'>Is at home</span> : 
              <span className='badge badge-secondary p-3'>Is not at home</span> }
            </p>
            <p className='card-text'>Timestamp: { formatDate(new Date(isAtHomeData.timestamp)) }</p>
          </>
        ) }
      </div>
    </section>
  );
};

export default IsAtHomeComponent;