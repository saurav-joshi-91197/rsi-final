const sendMsg = require('./playground/sendMsg');

function generateOTP() {

    // Declare a digits variable
    // which stores all digits
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

let finalOTP = generateOTP();
console.log("OTP of 4 digits: ");
console.log( finalOTP );

no = '7261999059';

sendMsg.sendMsg(finalOTP, no);