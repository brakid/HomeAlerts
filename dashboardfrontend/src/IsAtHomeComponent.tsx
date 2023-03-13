import { SingleDataProps } from './types';
import { formatDate } from './utils';

const IsAtHomeComponent = ({ data: isAtHomeData }: SingleDataProps<boolean>) => {
  return (
    <div>
      <span>{ isAtHomeData.data ? 'Is at home' : 'Is not at home' }</span>
      <span>Timestamp: { formatDate(new Date(isAtHomeData.timestamp)) }</span>
    </div>
  )
};

export default IsAtHomeComponent;