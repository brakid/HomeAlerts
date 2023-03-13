import { Line } from 'react-chartjs-2';
import { DataProps } from './types';
import { formatDate } from './utils';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);

const TemperatureChart = ({ data }: DataProps<number>) => {
  return (
    <section className='card mb-4 d-flex flex-column align-items-center shadow-sm'>
      <div className='card-img-top' style={{ height: '200px', width: '320px' }}>
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
    </section>
  );
};

export default TemperatureChart;