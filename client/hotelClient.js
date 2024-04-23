const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');  // For random ID generation

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BOOK_ROOM_PROTO_PATH = path.join(__dirname, '..', 'proto', 'BookRoom.proto');
const CHECK_IN_PROTO_PATH = path.join(__dirname, '..', 'proto', 'CheckIn.proto');
const PROCESS_CHECK_OUT_PROTO_PATH = path.join(__dirname, '..', 'proto', 'ProcessCheckOut.proto');

const bookRoomPackageDefinition = protoLoader.loadSync(BOOK_ROOM_PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const checkInPackageDefinition = protoLoader.loadSync(CHECK_IN_PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const processCheckOutPackageDefinition = protoLoader.loadSync(PROCESS_CHECK_OUT_PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const bookRoomClient = new (grpc.loadPackageDefinition(bookRoomPackageDefinition).hotel).BookRoomService('localhost:50051', grpc.credentials.createInsecure());
const checkInClient = new (grpc.loadPackageDefinition(checkInPackageDefinition).hotel).CheckInService('localhost:50051', grpc.credentials.createInsecure());
const processCheckOutClient = new (grpc.loadPackageDefinition(processCheckOutPackageDefinition).hotel).CheckOutService('localhost:50051', grpc.credentials.createInsecure());

let sessionData = {};

function displayMenu() {
  console.log("\nWelcome to Smart Hotel");
  console.log("Menu Options:");
  console.log("1) Booking");
  console.log("2) Check-in");
  console.log("3) Check-out");
  rl.question('Enter your choice: ', handleMenuOption);
}

function handleMenuOption(option) {
  switch (option.trim()) {
    case '1':
      performBooking();
      break;
    case '2':
      performCheckIn();
      break;
    case '3':
      performCheckOut();
      break;
    default:
      console.log("Invalid option. Please try again.");
      displayMenu();
  }
}

function performBooking() {
  console.log("Welcome to the Booking");
  rl.question('Enter your name: ', guestName => {
    rl.question('How many nights? ', numberOfNights => {
      const request = { guestName, numberOfNights: parseInt(numberOfNights) };
      const stream = bookRoomClient.BookRoom(request);
      stream.on('data', (response) => {
        console.log(`Booking Successful, Booking ID: ${response.bookingId}`);
        sessionData = { guestName, numberOfNights: parseInt(numberOfNights), bookingId: response.bookingId, totalCost: parseInt(numberOfNights) * 120 };
      });
      stream.on('end', () => {
        handleNextAction();
      });
    });
  });
}

function performCheckIn() {
  console.log("Welcome to the Check-in");
  const stream = checkInClient.CheckIn((error, response) => {
    if (error) {
      console.log('Error during check-in:', error);
    } else {
      console.log(`Check-In Successful, Room ID: ${response.roomId}`);
      sessionData.roomId = response.roomId;
      handleNextAction();
    }
  });

  rl.question('Enter your Booking ID: ', bookingId => {
    stream.write({ bookingId: parseInt(bookingId), guestName: sessionData.guestName });
    stream.end();
  });
}

function performCheckOut() {
  console.log("Welcome to the Check-out");
  rl.question('Enter your Booking ID: ', bookingId => {
    const request = { bookingId: parseInt(bookingId) };
    const stream = processCheckOutClient.ProcessCheckOut();

    // Envie a solicitação para o servidor
    stream.write(request);

    stream.on('data', (response) => {
      if (response.success) {
        console.log(`Check-Out Successful for booking ID ${bookingId}`);
        console.log(`Guest: ${sessionData.guestName}`);
        console.log(`Room ID: ${sessionData.roomId}`);
        console.log("Total cost: " + (sessionData.numberOfNights * 120)); // Corrigido aqui
        rl.question('Select payment method:\n1) Credit Card\n2) Cash\nEnter your choice: ', paymentMethod => {
          const paymentMethodText = paymentMethod.trim() === '1' ? 'Credit Card' : 'Cash';
          console.log(`Payment successful with ${paymentMethodText}.`);
          console.log("Thank you for staying with us!");
          handleNextAction();
        });
      } else {
        console.log(`Error: ${response.message}`);
        handleNextAction();
      }
    });

    stream.on('end', () => {
      handleNextAction();
    });

    stream.on('error', (error) => {
      console.error('Error during check-out:', error);
      handleNextAction();
    });

    stream.end();
  });
}


function handleNextAction() {
  rl.question('Do you want to perform another action? (Y/N): ', answer => {
    if (answer.toLowerCase() === 'y') {
      displayMenu();
    } else {
      console.log("Goodbye!");
      rl.close();
    }
  });
}

function main() {
  displayMenu();
}

main();