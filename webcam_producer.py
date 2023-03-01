from kafka import KafkaProducer
import json
import cv2
import numpy as np
import base64
import schedule
import time

KAFKA_HOST = # URL

image_producer = KafkaProducer(
    bootstrap_servers=[KAFKA_HOST], 
    value_serializer=lambda x: json.dumps(x).encode('utf-8'))

camera = cv2.VideoCapture(0)

def take_image():
    _, image = camera.read()
    image = cv2.resize(image, (640, 480), cv2.INTER_CUBIC)
    _, image = cv2.imencode('.jpeg', image)
    image = base64.b64encode(image)
    image = image.decode('utf-8')
    return image

def capture_image():
    image = take_image()
    v = image_producer.send('webcam', image)
    print('Sent image', v)

if __name__ == '__main__':
    try:
        job = schedule.every(15).seconds.do(capture_image)
        while True:
            schedule.run_pending()
            time.sleep(1)
        schedule.cancel_job(job)
    finally:
        camera.release()
        del(camera)
