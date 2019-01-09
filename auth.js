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
     resolve();
   }else{
     reject();
   }
});})}

// ====================== mobNO and password verification promise =====================
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
// ============================== mobNo verification ===============================
  const authMobNo = (user, mobile) => {
    var uid = admin.database().ref('UserSignIn/'+user);
    return new Promise ((resolve, reject) => {uid.on('value',function(snapshot){
      if(snapshot.val().mobno === mobile){
        resolve();     
    }else{
        reject(); 
      }
    });
  })
  }

const updatePass = (user, newPass, callback) => {
  admin.database().ref('UserSignIn/'+user + '/pass').set(newPass);
  callback('/home');
}

// ========================= Get Total Price ======================================
let getTotalPrice = () => {
  let guestPrice;
  let membersPrice;
  let dependentPrice;
  let settings = admin.database().ref('Settings/');

  return new Promise((resolve, reject) => {settings.on('value', function(snapshot) {
    if(snapshot.val().guePrice === null || snapshot.val().memPrice === null || snapshot.val().memPrice === null){
        reject();
      }
    else{
        guestPrice = snapshot.val().guePrice ;
        membersPrice = snapshot.val().memPrice;
        dependentPrice = snapshot.val().memPrice;
        console.log('in auth.js' + guestPrice, membersPrice, dependentPrice);
        let obj = {
          Gp: guestPrice,
          Mp: membersPrice,
          Dp: dependentPrice
        };
        resolve(obj);
      }
  });
})
}

// ========================== EXPORTS =============================================
  module.exports.idVerify = idVerify;
  module.exports.authenticate = authenticate;
  module.exports.authMobNo = authMobNo;
  module.exports.updatePass = updatePass;
  module.exports.getTotalPrice = getTotalPrice;

