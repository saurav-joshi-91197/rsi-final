var admin = require("firebase-admin");
var serviceAccount = require("./ss.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rsi-ait.firebaseio.com"
});

/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rsi-project-656a3.firebaseio.com"
});
*/

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
let getTotalPrice = (rsiId) => {
  let guestPrice;
  let membersPrice;
  let dependentPrice;
  let dependentCount;
  let flag=0;
  let settings = admin.database().ref();
  return new Promise((resolve, reject) => {settings.on('value', function(snapshot)
  {
    snapshot.forEach(childSnapshot=>
      {
        if(childSnapshot.key==='Settings')
        {
          var prices=admin.database().ref('Settings');
          prices.on('value',snapshot=>
          {
            guestPrice=snapshot.val().guePrice;
            membersPrice=snapshot.val().memPrice;
            dependentPrice=snapshot.val().memPrice;
          })
        }
        if(childSnapshot.key==='DepCount')
        {
          console.log(rsiId);
          var dep=admin.database().ref('DepCount/'+rsiId+'/');
          dep.on('value',snapshot=>
          {
            dependentCount=snapshot.val().depCount;
          })
        }
      })
      if(guestPrice!=null && membersPrice!=null && dependentPrice!=null)
      {
        let obj = {
          Gp: guestPrice,
          Mp: membersPrice,
          Dp: dependentPrice,
          Dc: dependentCount
        };
        resolve(obj);
      }
      else
      {
        reject();
      }

  }
)})
}

// ============================= Get Movies =======================================
let getMovies = () => {
  let movies = admin.database().ref('Movies/');
  movies.orderByChild('date');
  let movieList = [" "," "," "," "," "," "," ",String("")];
  let h = 0;
    return new Promise((resolve, reject) => {
      movies.once('value', (snapshot) => {
      console.log(1);
      snapshot.forEach( childSnapshot => {
        movieList[h] = childSnapshot.val().image_url;
        h++;
      });
      if(movieList.length !== 0)
      resolve(movieList);
      else 
      reject();
    });
  });
}

// ========================== EXPORTS =============================================
  module.exports.idVerify = idVerify;
  module.exports.authenticate = authenticate;
  module.exports.authMobNo = authMobNo;
  module.exports.updatePass = updatePass;
  module.exports.getTotalPrice = getTotalPrice;
  module.exports.getMovies = getMovies;

