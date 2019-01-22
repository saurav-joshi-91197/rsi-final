const express = require('express');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const hbs = require('hbs');
const flash = require('connect-flash');
const app = express();
const auth=require("./auth.js")
const serviceAccount = require("./ss.json");
const sendMsg = require('./sendMsg.js');
let otp,mob,user;

function generateOTP() {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// ============================================= Flash ====================================
  app.use(flash());
// ============================================= Middleware ===============================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ============= Temporary Session Management =============================================
const session = require('express-session');
let sess;
app.use(session(
  {
    secret: 'j34H5+lNYNLmpFD5mUUSDg5M/bL5g+tmiRfeCt6L2hg=',
    resave: false,
    saveUninitialized: false
  }
  ));

//=========================================================================================

app.set('views', __dirname+'/views');
app.set('view engine', 'hbs');

hbs.registerHelper('if_eq', function(a, b, opts) {
  if(a == b)
      return opts.fn(this);
  else
      return opts.inverse(this);
});


app.use(express.static('./public'));

//===============================================GET=======================================

app.get('/', function (req, res) {
  res.render('idLogin.hbs', { messages: req.flash('invalidID') });
});

app.get('/requestOTP', (req, res)=>{
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if(sess.rsiid||sess.rsiAdmin)
  {
    res.render('userPhoneVerify.hbs', {messages: req.flash('invalidMobNo')});
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/home',function(req,res)
{
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {
    res.render('home.hbs');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/userLogin', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin))
  {res.render('userLogin.hbs', {messages:req.flash('invalidUser')});}
  else
  {res.redirect('/');}
});

app.get('/sendOTP', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {
    res.render('sendOTP.hbs', {messages: req.flash('invalidOTP')});
  }
  else{
    res.redirect('/requestOTP');
  }
});

app.get('/changePassword', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo && sess.otp)
  {
    res.render('changePassword.hbs', {messages: req.flash('unequalPassword')});
  }
  else
  {
    res.redirect('/sendOTP');
  }
});

app.get('/contact', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {
    res.sendFile(__dirname+'/public/contact.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/history', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {
    res.sendFile(__dirname+'/public/history.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/addMovie',(req,res)=>
{
  sess=req.session;
  if(sess.rsiAdmin&&sess.mobNo)
  {
    res.render('addmovie.hbs');
  }
  else
  {
    res.redirect('/movies');
  }
})

app.get('/movieAdded',(req,res)=>
{
  sess=req.session;
  if(sess.rsiAdmin&&sess.mobNo)
  {
    res.redirect('/movies');
  }
  else
  {
    res.redirect('/');
  }
})

app.get('/deleteMovie',(req,res)=>
{
  movieKey=req.query.key;
  console.log(movieKey);
  var ref=admin.database().ref('Movies/'+movieKey).remove();
  res.redirect('/movies');
})

app.get('/adminBooking',(req,res)=>
{
  sess=req.session;
  if(sess.rsiAdmin&&sess.mobNo)
  {
    res.render('adminBooking.hbs');
  }
  else
  {
    res.redirect('/movies');
  }
})

app.get('/adminVSuser',(req,res)=>
{
  sess=req.session;
  sess.movieKey=req.query.key;
  console.log("AdminVSUser :"+sess.rsiAdmin+" "+sess.mobNo+" "+sess.newMob+" "+sess.rsiid);
  if(user==='A-007')
  {
    res.redirect('/adminBooking');
  }
  else
  {
    res.redirect('/dependents');
  }
})

app.get('/movies', (req, res) => {
  sess = req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {
    auth.getMovies(sess.rsiid)
    .then((obj)=>
    {
      res.render('movie.hbs',{
        movieDetails : obj,
        adminId: sess.rsiAdmin
      });
    },()=>
    {
      console.log("Reject");
    })
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/dependents', (req, res) => {
  sess = req.session;
  auth.checkBooking(sess.rsiid,sess.movieKey)
  .then(()=>
  {
    if(sess.rsiid && (sess.mobNo||sess.newMob)){
      auth.getTotalPrice(sess.rsiid)
      .then((obj) => {
        console.log(obj.Gp, obj.Mp, obj.Dp,obj.Dc);
        res.render('dependents.hbs', obj);
      }, () => {
        res.redirect('/movies');
      });
    }
    else{
      res.redirect('/');
    }
  },()=>
  {
      console.log("Already Booked!!!");
      req.flash('movieBooked', 'You Have Already Booked Tickets For This Movie!!!');
      res.redirect('/movies');
  })

});

app.get('/myTickets', (req, res) => {
  sess=req.session;
  if(sess.rsiAdmin==='A-007')
  {
    sess.rsiid='A-007';
  }
  if((sess.rsiid||sess.rsiAdmin) && sess.mobNo)
  {auth.getTickets(sess.rsiid)
  .then((ticketArr)=> {
    res.render('myTickets.hbs', {
      ticketDetails: ticketArr
    });
  },
   () => {
    console.log('Some Error Is There!!!');
  });}

  else
  {
    res.redirect('/userLogin');
  }
});

app.get('/layout', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  sess = req.session;
  if(sess.rsiid && (sess.mobNo||sess.newMob) && sess.movieKey)
  {
    res.render('seatlayout.hbs', {
      rsiid: sess.rsiid,
      movieKey: sess.movieKey,
      totalSeats: sess.totalSeats
    });
  }
  else
  {
    res.redirect('/movies');
  }
});

app.get('/summary', (req, res)=>{
  sess = req.session;
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let seats = req.query.seats;
  let arrSeats = JSON.parse(decodeURI(seats)).arr1;
  let stringValues = [];
  for(let key1 in arrSeats){
    stringValues.push(String(arrSeats[key1]));
  }
  let seatValues = "";
  for(let key in arrSeats){
    seatValues += arrSeats[key]+" ";
  }
  sess.arrSeats=stringValues;
  console.log(seatValues);
  if(sess.rsiid && sess.mobNo && sess.movieKey)
  {
    auth.getSummary(sess.movieKey).then((details)=>{
      sess.movieName = details.name;
      sess.time = details.time;
      sess.date = details.date;
    res.render('summary.hbs', {
      rsiid: sess.rsiid,
      price: sess.totalPrice,
      movie: details.name,
      date: details.date,
      time: details.time,
      seats: seatValues
      });
    },
    ()=>{console.log('In Reject Of Summary!!!');});
  }
  else
  {
    res.redirect('/movies');
  }
});

app.get('/ticket', (req, res) => {
  sess = req.session;
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  sess.movieKey = undefined;
  let seats = '';
  for(let key in sess.arrSeats){
    seats += sess.arrSeats[key]+" ";
  }
  sendMsg.sendBookingConfirmation(sess.rsiid, seats, sess.movieName, sess.time, sess.date, sess.mobNo);
  let ts = new Date().toLocaleString();
  console.log(ts);
  res.render('qrcode.hbs', {
    movie: sess.movieName,
    date: sess.date,
    time: sess.time,
    seats: seats,
    rsiid: sess.rsiid,
    price: sess.totalPrice,
    seatList: sess.arrSeats
  });
});

app.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

//============================================POST=========================================

app.post('/phoneVerify', function (req, res) {
  let mobNo = req.body.mobNo;
  sess = req.session;
  auth.authMobNo(ses.rsiid, mobNo)
  .then(()=>{
    otp = generateOTP();
    sendMsg.sendOTP(otp, mobNo)
    sess.mobNo = mobNo;
    res.redirect('/sendOTP');
  }, () => {
    req.flash('invalidMobNo', 'Invalid Mobile Number! Please Try Again!!!');
    res.redirect('/requestOTP');
  });
})

app.post('/changePasswordVerify', function (req, res) {
  var newPass=req.body.newPass;
  var cnfmPass=req.body.cnfmPass;
  if(newPass === cnfmPass)
    {
      auth.updatePass(sess.rsiid, newPass, (filename)=>{
      res.redirect(filename);
    });
  }
  else
  {
    req.flash('unequalPassword', 'Password Don\'t Match!!!');
    res.redirect('/changePassword');
  }
});

app.post('/OTPVerify', function (req, res) {
  sess = req.session;
  if(req.body.otp === otp)
  {
    sess.otp = req.body.otp;
    res.redirect('/changePassword');
  }
  else
  {
    req.flash('invalidOTP', 'Invalid OTP!!!');
    res.redirect('/sendOTP');
  }
});

app.post('/idVerify',function(req,res){
  var field1=req.body.field1;
  var field2=req.body.field2;
  user=field1+'-'+field2;
  user=user.toString();
  sess = req.session;
  auth.idVerify(user)
  .then(()=>{
    if(user==='A-007')
    {
      sess.rsiAdmin='A-007';
      sess.rsiid=user;
    }
    else
    {
      sess.rsiid = user;
    }
    res.redirect('/userLogin');
  }, ()=>{
    req.flash('invalidID', 'Invalid RSI-ID! Please Try Again!');
    res.redirect('/');
  });
});

app.post('/userVerify',function(req,res){
  mobNo = req.body.mobNo;
  sess = req.session;
	var password=req.body.rsipass;
   auth.authenticate(sess.rsiid,mobNo,password)
   .then(()=>{
     sess.mobNo = mobNo;
     res.redirect('/home');
   }, ()=>{
     req.flash('invalidUser','Invalid Number Or Password!!!');
     res.redirect('/userLogin');
   }); 
});

app.post('/movieAdded', (req,res)=>{
  var certification = req.body.certification;
  var date = req.body.date;
  var duration = req.body.duration;
  var language = req.body.language;
  var name = req.body.movieName;
  var timing = req.body.timing;
  var imageFile = req.body.imageFile;
  var Users = {'-1':{'time':admin.database.ServerValue.TIMESTAMP}};
  var status = ['A','A', 'A','A','A', 'A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A','A','A', 'A','A'];

  admin.database().ref('Movies/').push({
      certification : certification,
      date : date,
      image_url : imageFile,
      duration : duration,
      language : language,
      hall : {Users, status},
      name : name,
      timing : timing
  });
  res.redirect('/movieAdded');
});

app.post('/layout', (req, res)=>{
  sess = req.session;
  sess.totalPrice = parseInt(req.body.price);
  sess.totalSeats = req.body.seats;
  res.redirect('/layout');
});

app.post('/adminUserDetails',(req,res)=>
{
  sess=req.session;
  sess.rsiid=req.body.rsiid;
  sess.newMob=req.body.newMob;
  res.redirect('/dependents');
})

app.post('/book', (req, res) => {
  sess = req.session;
  auth.bookTicket(sess.arrSeats, sess.movieKey).then(()=>{res.redirect('/ticket')});
  auth.insertTicket(sess.rsiid, sess.arrSeats, sess.movieName, sess.time, sess.date, sess.totalPrice);
  });

const server = app.listen(process.env.PORT || 5000);