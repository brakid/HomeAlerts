FROM golang:latest AS builder

ENV CGO_ENABLED=0

WORKDIR /go/src/app

COPY go.mod .
COPY go.sum .
RUN go mod download
RUN go mod verify

COPY ./*.go .

RUN go build -ldflags="-s -w" -o hostdiscovery.out .

FROM alpine:latest

ENV TARGET_HOST=localhost
ENV KAFKA_BROKER=localhost

WORKDIR /app

COPY --from=builder /go/src/app/hostdiscovery.out .

CMD ["./hostdiscovery.out"]