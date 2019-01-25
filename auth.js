var admin = require("firebase-admin");
var serviceAccount = require("./sj.json");
const dateTime = require('date-time');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rsi-demo.firebaseio.com/"
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
    console.log("User Is: "+mobile+" "+pass);
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
// ============================== Change Password =================================

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
        /*
        if(childSnapshot.key==='DepCount')
        {
          var dep=admin.database().ref('DepCount/'+rsiId+'/');
          console.log(dep);
          dep.on('value',snapshot=>
          {
            dependentCount=snapshot.val().depCount;
          })
        }*/
        dependentCount=0;
      });
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

let checkBooking = (rsiid, movieKey) => {
  var dateOfMovie,nameOfMovie;
  return new Promise((resolve,reject)=>
  {
    var ref = admin.database().ref('Movies/'+movieKey);
    ref.on('value',function(snapshot)
    {
      snapshot.forEach(childSnapshot=>
        {
          if(childSnapshot.key==='date')
          {
            dateOfMovie=childSnapshot.val();
          }
          if(childSnapshot.key==='name')
          {
            nameOfMovie=childSnapshot.val();
          }
        })

        var ref1 = admin.database().ref("Tickets/"+rsiid);
        ref1.on('value',function(snapshot){
          snapshot.forEach(childSnapshot=>{
            var ref2 = admin.database().ref("Tickets/"+rsiid+"/"+childSnapshot.key);
            ref2.on('value',function(snapshot){
              if(snapshot.val().movieNmae===nameOfMovie && snapshot.val().date===dateOfMovie){
                reject();
              }
              })
            })
            resolve();
        })     
})
})
}

// ============================= Get Movies =======================================

let getMovies=function(rsiid)
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
            timing:childSnapshot.val().timing,
            rsiid:rsiid
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
    var flag=0;
    return new Promise((resolve, reject) => { for(i=0; i<arr.length; i++){
        admin.database().ref('Movies/'+movieKey+'/hall/status/'+arr[i]).set("R");  
        flag+=1;
      }
      if(flag===arr.length)
      {
        resolve();
      }
  });
}

// ============================ Insert Ticket Data ================================

let insertTicket = (userID, arr, movieNmae, movietime, date, cost) => {
  admin.database().ref('Tickets/'+userID+"/").push({
    cost : cost,
    date : date,
    movieNmae : movieNmae,
    movietime : movietime,
    provisional : true,
    timestamp : dateTime(admin.database.ServerValue.TIMESTAMP),
    userID : userID,
    seatsList : arr
});
admin.database().ref('Tickets/'+'A-007'+"/").push({
  cost : cost,
  date : date,
  movieNmae : movieNmae,
  movietime : movietime,
  provisional : true,
  timestamp : dateTime(admin.database.ServerValue.TIMESTAMP),
  userID : userID,
  seatsList : arr
});
admin.database().ref('Summary/'+date+'/'+userID+'/').set({
  date : date,
  dependents : '0',
  guest :'0',
  member : '0',
  movieName : movieNmae,
  rsiID : userID,
  seats : 'Default',
  time :movietime,
  totalCost : cost,
  typeOfTicket : 'Provisional'
});//InComplete!!!
}

// ========================== Get Tickets =========================================

let getTickets = (user) => {
  console.log('in function');
  let ticketArr = [];
  let tickets = admin.database().ref('Tickets/' + user);
  return new Promise ((resolve, reject) => 
  {tickets.on('value', (snapshot) => {
    snapshot.forEach(childSnapshot => {
      ticketArr.push(childSnapshot.val());
    });
    resolve(ticketArr);}
  )});
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
module.exports.insertTicket = insertTicket;
module.exports.getTickets = getTickets;
module.exports.checkBooking = checkBooking;

