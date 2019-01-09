const express = require('express');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const hbs = require('hbs');
const flash = require('connect-flash');
const app = express();
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

// ============================================= Flash ====================================
  app.use(flash());
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
  res.render('idLogin.hbs', { messages: req.flash('invalidID') });
});

app.get('/requestOTP', (req, res)=>{
  sess = req.session;
  if(sess.rsiid)
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
  if(sess.rsiid && sess.mobNo)
  {
    console.log(sess.rsiid);
    console.log(sess.mobNo);
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
  {res.render('userLogin.hbs', {messages:req.flash('invalidUser')});}
  else
  {res.redirect('/');}
});

app.get('/sendOTP', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.render('sendOTP.hbs', {messages: req.flash('invalidOTP')});
  }
  else{
    res.redirect('/requestOTP');
  }
});

app.get('/changePassword', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo && sess.otp)
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
  if(sess.rsiid && sess.mobNo)
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
  if(sess.rsiid && sess.mobNo)
  {
    res.sendFile(__dirname+'/public/history.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/movies', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.sendFile(__dirname+'/public/movie.html');
  }
  else
  {
    res.redirect('/');
  }
});

app.get('/dependents', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo){
    auth.getTotalPrice()
    .then((obj) => {
      console.log(obj.Gp, obj.Mp, obj.Dp);
      res.render('dependents.hbs', obj);
    }, () => {
      res.redirect('/movies');
    });
  }
  else{
    res.redirect('/');
  }
});

app.get('/layout', (req, res) => {
  sess = req.session;
  if(sess.rsiid && sess.mobNo)
  {
    res.sendFile(__dirname+'/public/seatlayout.html');
  }
  else
  {
    res.redirect('/movie');
  }
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
  auth.authMobNo(user, mobNo)
  .then(()=>{
    otp = generateOTP();
    sendOTP.sendMsg(otp, mobNo)
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
      auth.updatePass(user, newPass, (filename)=>{
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
   user=req.body.rsiid;
   sess = req.session;
   auth.idVerify(user)
   .then(()=>{
     sess.rsiid = req.body.rsiid;
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
   auth.authenticate(user,mobNo,password)
   .then(()=>{
     sess.mobNo = mobNo;
     res.redirect('/home');
   }, ()=>{
     req.flash('invalidUser','Invalid Number Or Password!!!');
     res.redirect('/userLogin');
   }); 
});

const server = app.listen(process.env.PORT || 5000);