import { Server } from 'socket.io';
import { Kafka, Message } from 'kafkajs';
import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';
import { merge, parseAs } from './utils';
import { Status, IsAtHome, Temperature } from './types';

const MAX_TEMPERATURE_VALUES = 100;

const handleMessage = (message: Message, topic: string, status: Status, io: Server): void => {
  const messageContent = getMessageContent(message);
  const timestamp = parseInt(message.timestamp || '0', 10);
  console.log(`Topic: ${topic}`);
  switch (topic) {
    case 'webcam': {
      status.webcam = { timestamp, data: 'data:image/jpeg;base64,' + messageContent.replaceAll('"', '') };
      break;
    }
    case 'webcam2': {
      status.webcam2 = { timestamp, data: 'data:image/jpeg;base64,' + messageContent.replaceAll('"', '') };
      break;
    }
    case 'host_discovered': {
      status.isAtHome = { timestamp, data: parseAs<IsAtHome>(messageContent).value };
      break;
    }
    case 'temperature': {
      status.temperatures = merge(status.temperatures, { timestamp, data: parseAs<Temperature>(messageContent).value }, MAX_TEMPERATURE_VALUES);
      break;
    }
  }
  io.emit('status', status);
};

const getMessageContent = (message: Message): string => {
  return message.value?.toString() || '';
};

const startDashboard = async () => {
  const io = new Server(8080, { cors: { origin: '*' } });
  const mutex = new Mutex();
  const status: Status = { isAtHome: { timestamp: 0, data: false }, webcam: { timestamp:0, data: '' }, webcam2: { timestamp:0, data: '' }, temperatures: [] };

  const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER || '']
  });

  const consumer = kafka.consumer({ groupId: uuidv4() });

  await consumer.connect();
  await consumer.subscribe({ topics: ['webcam', 'webcam2', 'host_discovered', 'temperature'], fromBeginning: false });

  io.on('connect', socket => {
    mutex.acquire();
    socket.emit('status', status);
    mutex.release()
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      mutex.acquire();
      handleMessage(message, topic, status, io);
      mutex.release();
    },
  });
};

startDashboard();