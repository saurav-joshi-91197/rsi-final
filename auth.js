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

let getMovies=function()
{
  let movieDetails=admin.database().ref('Movies/');
  return new Promise((resolve,reject)=>
  {
    movieDetails.orderByChild('date');
    movieDetails.on('value',function(snapshot)
    {
      var obj=[];
      snapshot.forEach(childSnapshot=>
        {
          let newobj=
          {
            movieKey:childSnapshot.key,
            certification:childSnapshot.val().certification,
            date:childSnapshot.val().date,
            duration:childSnapshot.val().duration,
            image_url:childSnapshot.val().image_url,
            language:childSnapshot.val().language,
            name:childSnapshot.val().name,
            timing:childSnapshot.val().timing
          }
          obj.push(newobj);
        })
        resolve(obj);
      })
    
  })
}
// ======================================= Get Summary ============================

let getSummary = (movieId)=>{
  let movie = admin.database().ref('Movies/'+movieId);
  let details = {};
  return new Promise((resolve, reject) => {
    movie.once('value', (snapshot)=>{
      details.time = snapshot.val().timing;
      details.date = snapshot.val().date;
      details.name = snapshot.val().name;
    });
    resolve(details);
  });
}

// ============================ Book ticket =======================================

let bookTicket = (arr, movieKey)=>{
    var i;
    console.log(arr);
    for(i=0; i<arr.length; i++){
        admin.database().ref('Movies/'+movieKey+'/hall/status/'+arr[i]).set("R");
    }
}

// ========================== EXPORTS =============================================
  module.exports.idVerify = idVerify;
  module.exports.authenticate = authenticate;
  module.exports.authMobNo = authMobNo;
  module.exports.updatePass = updatePass;
  module.exports.getTotalPrice = getTotalPrice;
  module.exports.getMovies = getMovies;
  module.exports.getSummary = getSummary;
  module.exports.bookTicket = bookTicket;

