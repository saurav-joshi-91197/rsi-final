const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const admin = require("firebase-admin");
const hbs = require('hbs');
const auth=require("./auth.js")
const serviceAccount = require("./sk.json");
const sendOTP = require('./sendMsg.js');
let otp,mob,user;


function generateOTP() {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// ============================================= Middleware ===============================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ============= Temporary Session Management =============================================
const session = require('express-session');
let sess;
app.use(session({secret: 'j34H5+lNYNLmpFD5mUUSDg5M/bL5g+tmiRfeCt6L2hg='}));
//=========================================================================================

app.set('views', __dirname+'/views');
app.set('view engine', 'hbs');

app.use(express.static('./public'));

//===============================================GET======================================

app.get('/', function (req, res) {
  res.render('idLogin.hbs');
});

app.get('/requestOTP', (req, res)=>{
  sess = req.session;
  if(sess.rsiid)
  {
    res.render('userPhoneVerify.hbs');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/home',function(req,res)
{
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
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
  if(sess.rsiid)
  {res.render('userLogin.hbs');}
  else
  {res.redirect('/');}
});

app.get('/sendOTP', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('sendOTP.hbs');
  }
  else{
    res.redirect('/requestOTP');
  }
});

app.get('/changePassword', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo && sess.otp)
  {
    res.redirect('/home');
  }
  else
  {
    res.redirect('/sendOTP');
  }
});

app.get('/contact', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('../public/contact.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/history', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('../public/history.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/movie', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('../public/movie.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/layout', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('layout.html');
  }
  else
  {
    res.redirect('/movie');
  }
});


//============================================POST=========================================

app.post('/phoneVerify', function (req, res) {
  let mobNo = req.body.mobNo;
  sess = req.session;
  auth.authMobNo(user, mobNo)
  .then(()=>{
    otp = generateOTP();
    sendOTP.sendMsg(otp, mobNo)
    sess.mobNo = mobNo;
    res.redirect('/sendOTP');
  }, () => {
    console.log('error in otp module');
  });
})

app.post('/changePasswordVerify', function (req, res) {
  var newPass=req.body.newPass;
  var cnfmPass=req.body.cnfmPass;
  if(newPass === cnfmPass)
    {
      auth.updatePass(user, newPass, (filename)=>{
      res.redirect(filename);
    });

  }
});

app.post('/OTPVerify', function (req, res) {
  sess = req.session;
  if(req.body.otp === otp)
  {
    sess.otp = req.body.otp;
    res.redirect('/changePassword');
  }
});

app.post('/idVerify',function(req,res){
   user=req.body.rsiid;
   sess = req.session;
   auth.idVerify(user)
   .then(()=>{
     sess.rsiid = req.body.rsiid;
     res.redirect('/userLogin');
   }, ()=>{
     console.log('error in verifying ID');
   });
});

app.post('/userVerify',function(req,res){
  mobNo = req.body.mobNo;
  sess = req.session;
	var password=req.body.rsipass;
   auth.authenticate(user,mobNo,password)
   .then(()=>{
     sess.mobNo = mobNo;
     res.redirect('/home');
   }, ()=>{
     console.log('error in mobile number authentication');
   }); 
});

const server = app.listen(process.env.PORT || 5000);