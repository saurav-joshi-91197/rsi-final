var admin = require("firebase-admin");
var serviceAccount = require("./ss.json");
const dateTime = require('date-time');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rsi-demo.firebaseio.com"
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

// ====================== mobNO and password Verification Promise =====================
const authenticate = (user, mobile, pass) => {
    var uid = admin.database().ref('UserSignIn/'+user);
  console.log("User Is: "+user+mobile+" "+pass);
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
// ============================== mobNo Verification ===============================
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

//=============================== mobNo And User Verification======================

const authMobUser = (user, mobile) => {
  var uid = admin.database().ref('UserSignIn/');
  return new Promise ((resolve, reject) => {uid.on('value',function(snapshot){
    uid.on('value',snapshot=>
    {
      snapshot.forEach(childSnapshot=>
        {
          ref=admin.database().ref('UserSignIn/'+user);
          ref.on('value',snapshot=>
          {
            if(snapshot.val().mobno===mobile)
            {
              resolve();
            }
            else
            {
              reject();
            }
          })
        })
    })
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
  let dependentCount=null;
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
          var DepCount=admin.database().ref('DepCount');
          DepCount.on('value',snapshot=>
          {
            snapshot.forEach(childSnapshot=>
              {
                if(childSnapshot.key===rsiId)
                {
                  ref=admin.database().ref('DepCount/'+rsiId+'/depCount');
                  ref.on('value',snapshot=>
                  {
                    dependentCount=snapshot.val();
                  })
                }
              })
          })
        }
      });
      if(dependentCount===null)
      {
        dependentCount=0;
      }
      //console.log(dependentCount);
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
  let movieDetails=admin.database().ref('Movies/').orderByChild('date');
  return new Promise((resolve,reject)=>
  {
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

let insertTicket = (userID, arr,seatValues, movieNmae, movietime, date, cost,member,dependents,guests) => {
  let totalCost='₹'+cost.toString();
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
admin.database().ref('Tickets/'+'S-2119'+"/").push({
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
  dependents : dependents,
  guest : guests,
  member : member,
  movieName : movieNmae,
  rsiID : userID,
  seats : seatValues,
  time :movietime+" hr",
  totalCost : totalCost,
  typeOfTicket : 'Provisional Ticket'
});

}

// ========================== Get Tickets =========================================

let getTickets = (user) => {
  let ticketArr = [];
  let seatsArr = [];
  return new Promise ((resolve, reject) => 
  { let tickets = admin.database().ref('Tickets/' + user).orderByChild('date');
    tickets.on('value', (snapshot) => 
    {
    snapshot.forEach(childSnapshot =>
    {
      let map={};
      map['cost']=childSnapshot.val().cost;
      map['date']=childSnapshot.val().date;
      map['movieNmae']=childSnapshot.val().movieNmae;
      map['movietime']=childSnapshot.val().movietime;
      map['provisional']=childSnapshot.val().provisional;
      map['seatsList']=childSnapshot.val().seatsList;
      map['timestamp']=childSnapshot.val().timestamp;
      map['userID']=childSnapshot.val().userID;
      
      seatsArr=childSnapshot.val().seatsList;

let seatsMap =[];
var mapp = {};
var i;
for(i=0; i<359; i++){
    if(i>=0 && i<22){
        mapp[i]='B'+(i+1);
    }
    else if(i>=22 && i<42){
        mapp[i]='C'+(i-21);
    }
    else if(i>=42 && i<64){
        mapp[i]='D'+(i-41);
    }
    else if(i>=64 && i<84){
        mapp[i]='E'+(i-63);
    }
    else if(i>=84 && i<106){
        mapp[i]='F'+(i-83);
    }
    else if(i>=106 && i<126){
        mapp[i]='G'+(i-105);
    }
    else if(i>=126 && i<148){
        mapp[i]='H'+(i-125);
    }
    else if(i>=148 && i<168){
        mapp[i]='I'+(i-147);
    }
    else if(i>=168 && i<190){
        mapp[i]='J'+(i-167);
    }
    else if(i>=190 && i<210){
        mapp[i]='K'+(i-189);
    }
    else if(i>=210 && i<232){
        mapp[i]='L'+(i-209);
    }
    else if(i>=232 && i<252){
        mapp[i]='M'+(i-231);
    }
    else if(i>=252 && i<274){
        mapp[i]='N'+(i-251);
    }
    else if(i>=274 && i<294){
        mapp[i]='O'+(i-273);
    }
    else if(i>=294 && i<316){
        mapp[i]='P'+(i-293);
    }
    else if(i>=316 && i<336){
        mapp[i]='Q'+(i-315);
    }
    else if(i>=336 && i<358){
        mapp[i]='R'+(i-335);
    }
}

for(let key in seatsArr)
{
  seatsMap.push(mapp[seatsArr[key]]);
}


      console.log(seatsArr); 
      console.log(seatsMap);

      map['seatsMap']=seatsMap;
      ticketArr.push(map);
    })
      resolve(ticketArr);
    });    
  });
}

// ========================== EXPORTS =============================================
module.exports.idVerify = idVerify;
module.exports.authMobUser = authMobUser;
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