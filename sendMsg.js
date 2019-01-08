let http = require('http');
let urlencode = require('urlencode');

let sendMsg = (otp, mobNo) => {
  let msg_body = `Forgot Password! No problem, your OTP to reset password is ${otp},regards RSAMI!`
  let msg = urlencode(msg_body);
/*let msg = 'Forgot%20Password!%20No%20problem%2C%20your%20OTP%20to%20reset%20password%20is%20444639%2Cregards%20RSAMI!'*/
  let toNumber = mobNo;
  let username = 'srjbsht857@gmail.com';
  let hash = '582cd89f3e07f336abe5d2a63e04f31ca548dcb7e56a2cd64ba5b183a50723a5'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
  let sender = 'RSIPUN';
  let data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + toNumber + '&message=' + msg;
  let options = {
    host: 'api.textlocal.in', path: '/send?' + data
  };
  callback = function (response) {
    let str = '';//another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });//the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      // console.log(str);
    });
  }
  console.log("Sanjay");
  http.request(options, callback).end();
}

module.exports.sendMsg = sendMsg;