import { Server } from 'socket.io';
import { Kafka, Message } from 'kafkajs';
import { Mutex } from 'async-mutex';

interface IsAtHome {
  value: boolean
};

interface Temperature {
  value: number
};

interface Data<T> {
  timestamp: number,
  data: T,
};

interface Status {
  webcam: Data<string>,
  isAtHome: Data<boolean>,
  temperature: Data<number>,
};

const handleMessage = (message: Message, topic: string, status: Status, io: Server): void => {
  const messageContent = getMessageContent(message);
  const timestamp = parseInt(message.timestamp || '0', 10);
  console.log(`Topic: ${topic}`);
  switch (topic) {
    case 'webcam': {
      status.webcam = { timestamp, data: 'data:image/jpeg;base64,' + messageContent.replaceAll('"', '') };
      break;
    }
    case 'host_discovered': {
      status.isAtHome = { timestamp, data: parseAs<IsAtHome>(messageContent).value };
      break;
    }
    case 'temperature': {
      status.temperature = { timestamp, data: parseAs<Temperature>(messageContent).value };
      break;
    }
  }
  io.emit('status', status);
};

const getMessageContent = (message: Message): string => {
  return message.value?.toString() || '';
};

const parseAs = <T>(value: string): T => {
  return JSON.parse(value) as T;
};

const startDashboard = async () => {
  const io = new Server(8080, { cors: { origin: '*' } });
  const mutex = new Mutex();
  const status: Status = { isAtHome: { timestamp: 0, data: false }, webcam: { timestamp:0, data: '' }, temperature: { timestamp: 0, data: 0.0 } };

  const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER || '']
  });

  const consumer = kafka.consumer({ groupId: 'dashboard3' });

  await consumer.connect();
  await consumer.subscribe({ topics: ['webcam', 'host_discovered', 'temperature'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      mutex.acquire();
      handleMessage(message, topic, status, io);
      mutex.release();
    },
  });
};

startDashboard();