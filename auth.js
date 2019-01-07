var admin = require("firebase-admin");
var serviceAccount = require("./sk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rsi-project-656a3.firebaseio.com"
  });

const idVerify = (user, callback) => {
    var uid = admin.database().ref('UserSignIn/'+user);
 return new Promise ((resolve, reject) => {uid.on('value', function(snapshot) {
   if(snapshot.val()!==null){
     resolve();//callback('myregister.hbs');
   }else{
     reject();
   }
});})}

// mobNO and password verification promise
const authenticate = (user, mobile, pass) => {
    var uid = admin.database().ref('UserSignIn/'+user);
    console.log(mobile, pass);
  return new Promise( (resolve, reject) =>   
{  uid.on('value',function(snapshot){
    if(snapshot.val().mobno === mobile && snapshot.val().pass === pass){
      resolve();
    }else{
      reject();
    }
  });
});
}

  const authMobNo = (user, mobile) => {
    var uid = admin.database().ref('UserSignIn/'+user);
    return new Promise ((resolve, reject) => {uid.on('value',function(snapshot){
      if(snapshot.val().mobno === mobile){
        resolve();//callback('myotp.hbs');      
    }else{
        reject(); 
      }
    });
  })
  }

const updatePass = (user, newPass, callback) => {
  admin.database().ref('UserSignIn/'+user + '/pass').set(newPass);
  callback('index.hbs');
}

  module.exports.idVerify = idVerify;
  module.exports.authenticate = authenticate;
  module.exports.authMobNo = authMobNo;
  module.exports.updatePass = updatePass;
