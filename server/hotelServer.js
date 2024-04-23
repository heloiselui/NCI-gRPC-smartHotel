// hotelServer.js
// Import required modules
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const crypto = require('crypto');

// Define paths to proto files
const BOOK_ROOM_PROTO_PATH = path.join(__dirname, '..', 'proto', 'bookRoom.proto');
const CHECK_IN_PROTO_PATH = path.join(__dirname, '..', 'proto', 'checkIn.proto');
const PROCESS_CHECK_OUT_PROTO_PATH = path.join(__dirname, '..', 'proto', 'processCheckOut.proto');

// Load proto files and generate package definitions
const bookRoomPackageDefinition = protoLoader.loadSync(BOOK_ROOM_PROTO_PATH);
const checkInPackageDefinition = protoLoader.loadSync(CHECK_IN_PROTO_PATH);
const processCheckOutPackageDefinition = protoLoader.loadSync(PROCESS_CHECK_OUT_PROTO_PATH);

// Extract service definitions from package definitions
const bookRoomProto = grpc.loadPackageDefinition(bookRoomPackageDefinition).hotel;
const checkInProto = grpc.loadPackageDefinition(checkInPackageDefinition).hotel;
const processCheckOutProto = grpc.loadPackageDefinition(processCheckOutPackageDefinition).hotel;

// Define gRPC service functions

// Function to handle booking requests
function bookRoom(call) {
  // Generate a random booking ID
  const bookingId = crypto.randomInt(1000, 9999);
  // Log the booking request details
  console.log(`Booking request by ${call.request.roomId} for ${call.request.numberOfNights} nights.`);
  // Send a success response with the generated booking ID
  call.write({ success: true, message: "Booking Successful", bookingId: bookingId });
  // Close the call
  call.end();
}

// Function to handle check-in requests
function checkIn(call, callback) {
  let lastReceived = null;
  // Listen for incoming data
  call.on('data', (request) => {
    // Log the check-in request details
    console.log(`Check-in request for booking ID ${request.bookingId}`);
    lastReceived = request;
  });
  // When data stream ends, generate a random room ID and send a success response
  call.on('end', () => {
    const roomId = crypto.randomInt(100, 999);
    callback(null, { success: true, message: "Check-In Successful", roomId: roomId });
  });
}

// Function to handle check-out requests
function processCheckOut(call) {
  call.on('data', (request) => {
    // Log the check-out request details
    console.log(`Process check-out request for booking ID ${request.bookingId}`);
    // Calculate total cost based on request query and send a success response
    const totalCost = request.query === "totalCost" ? 200 * request.roomId : 0;
    call.write({ success: true, message: "Check-Out Successful", totalCost: totalCost });
  });
  // Close the call when data stream ends
  call.on('end', () => {
    call.end();
  });
}

// Main function to start the gRPC server
function main() {
  const server = new grpc.Server();
  // Add services to the server
  server.addService(bookRoomProto.BookRoomService.service, { BookRoom: bookRoom });
  server.addService(checkInProto.CheckInService.service, { CheckIn: checkIn });
  server.addService(processCheckOutProto.CheckOutService.service, { ProcessCheckOut: processCheckOut });
  // Bind the server to a port
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running on port 50051');
  });
}

// Call the main function to start the server
main();


