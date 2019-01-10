const fs = require('fs');
const qrcode = require('qrcode');

var admin = require("firebase-admin");
var serviceAccount = require("./sk.json");
var arrResult = [];
var reqstring = [];
var s;
var x ;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rsi-project-656a3.firebaseio.com"
  });

var uid = admin.database().ref('Tickets/A-007/').orderByChild('date');
uid.on('value',function(snapshot){
  snapshot.forEach(childSnapshot=>{
    arrResult.push(childSnapshot.key);
  });
  var def = admin.database().ref('Tickets/A-007/'+arrResult[0]);
  def.on('value',function(snapshot){
    snapshot.forEach(childSnapshot=>{
      if(childSnapshot.key==='seatsList'){
        var sea = admin.database().ref('Tickets/A-007/'+arrResult[0]+'/seatsList/');
        sea.on('value',function(snapshot){
          snapshot.forEach(childSnapshot=>{
            // x=JSON.stringify(childSnapshot);
            x=snapshot.val();
            //reqstring=reqstring+"_"+childSnapshot.val();
          });
        });
      }
      else{
        // x=JSON.stringify(childSnapshot);
        x = snapshot.val();
      }
    });
  });
  //console.log(reqstring);
  // var i;
  // s = reqstring[0];
  // for(i=1; i<reqstring.length; i++){
  //   s=s+reqstring[i];
  // }
  // x = String(s);

  s= JSON.stringify(x);
  let y = {
    Movietime: x.movietime,
    cost: x.cost,
    date: x.date,
    movieNmae:"Movie",
    provisional: x.provisional,
    seatsList: x.seatsList,
    timestamp: x.timestamp,
    userID: x.userID
  };
  console.log(JSON.stringify(y));
  let t = JSON.stringify(y);
  // for (var i = 0; i<s.length; i++){
  //
  // }
  console.log(s);

  run().catch(error => console.error(error.stack));

  async function run() {
    const res = await qrcode.toDataURL(t);

    fs.writeFileSync('./qr.html', `<img src="${res}">`);
    console.log('Wrote to ./qr.html');
  }

  //console.log(typeof ("11252-1-2019SIMMBA19:00true179222324255354646572732018-12-31 22:06:10.296A-001"));
});