# Smart Hotel

Welcome to the Smart Hotel! This system allows guests to book rooms, check in, and check out seamlessly using gRPC communication.

## Prerequisites

Before running the Smart Hotel, make sure you have the following installed:

- Node.js
- npm (Node Package Manager)
- gRPC

## Installation

To run the Smart Hotel, you'll need to install the following:

1. **Node.js:** Node.js is a JavaScript runtime environment that allows you to run JavaScript on the server. You can download and install it from the [official Node.js website](https://nodejs.org/).

2. **npm (Node Package Manager):** npm is the package manager for the Node.js ecosystem. It's used to install, share, and manage dependencies for Node.js projects. npm is typically installed automatically alongside Node.js.

3. **gRPC:** gRPC is an open-source RPC (Remote Procedure Call) framework developed by Google.

Commands:
npm install @grpc/grpc-js
npm install @grpc/proto-loader

These are the installations required to run the Smart Hotel project. Make sure you have all of these set up correctly before starting the project.

Follow the on-screen instructions to navigate through the booking, check-in, and check-out processes.

## Project Structure

- `proto/`: Contains protocol buffer files defining the service APIs.
- `hotelClient.js`: Front-end client application for interacting with gRPC services.
- `hotelServer.js`: Back-end server application implementing gRPC services.

## Protocol Buffers (.proto) Files

Protocol Buffers, also known as protobuf, are a way to define the structure of data that is serialized and deserialized for communication between different systems. The .proto files contain these message and service definitions.

### bookRoom.proto
- **Service**: BookRoomService
- **Call Type**: Server streaming
- **Description**: The `BookRoom` method uses server streaming to send multiple responses to the client after a single request. This is useful in scenarios where the server needs to send continuous updates or a series of messages after processing a request.

### checkIn.proto
- **Service**: CheckInService
- **Call Type**: Client streaming
- **Description**: The `CheckIn` method uses client streaming to allow the client to send multiple messages to the server in a single call. This can be used, for example, to progressively send data during a check-in process.

### processCheckOut.proto
- **Service**: CheckOutService
- **Call Type**: Bidirectional
- **Description**: The `ProcessCheckOut` method implements bidirectional streaming, where both the client and server can send and receive multiple messages independently and in any order. This is ideal for more complex interactions that require continuous communication from both sides.


### File Structure

A .proto file typically contains the following parts:

- Syntax Declaration: Defines the version of the protobuf syntax to be used, for example, `syntax = "proto3";`.
- Package Declaration: Defines the namespace for the messages and services defined in the file, for example, `package hotel;`.
- Message Definitions: Defines the data structures to be used for communication, including the fields and their types, for example, `message BookRoomRequest { ... }`.
- Service Definitions: Defines the offered services and available methods, specifying the input and output messages, for example, `service BookRoomService { ... }`.

### How to Use

- Compilation: .proto files are compiled using protobuf compilers to generate classes or stubs in various programming languages.
- Importing: .proto files can be imported into other .proto files for reusing message and service definitions.
- Implementation: The messages and services defined in .proto files are implemented in actual code to perform desired operations, such as network communication, data storage, etc.

### Reference

To learn more about the syntax and possibilities offered by .proto files, refer to the official Protocol Buffers documentation: [Protocol Buffers - Language Guide](https://developers.google.com/protocol-buffers/docs/proto3).

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

