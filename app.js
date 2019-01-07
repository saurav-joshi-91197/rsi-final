const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const admin = require("firebase-admin");
const hbs = require('hbs');
const auth=require("./auth.js")
const serviceAccount = require("./sk.json");
const sendOTP = require('./playground/sendMsg.js');
let otp,mob,user;

function generateOTP() {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', __dirname+'/views');
app.set('view engine', 'hbs');

app.use(express.static('./public'));


app.get('/', function (req, res) {
  res.render('myfront.hbs');
});

app.get('/reqOTP', (req, res)=>{
  res.render('myphone.hbs');
})

app.post('/myphone', function (req, res) {
  let mobile = req.body.mobNo; 
  auth.authMobNo(user, mobile)
  .then(()=>{
    otp = generateOTP();
    sendOTP.sendMsg(otp, mobile)
    console.log("Saurav");
    res.render('myotp.hbs');
  }, () => {
    console.log('error in otp module');
  });
})

app.get('/home',function(req,res)
{
  res.render('index.hbs');
})

app.get('/contacthome',function(req,res)
{
  res.render('index.hbs');
})


app.get('/historyhome',function(req,res)
{
  res.render('index.hbs');
})

app.post('/newphone', function (req, res) {
  var newPass=req.body.newPass;
  var cnfmPass=req.body.cnfmPass;
  if(newPass === cnfmPass)
    {
      auth.updatePass(user, newPass, (filename)=>{
      res.render(filename);
    });

  }
  // else
  // res.send('error');
});

app.post('/myotp', function (req, res) {
  if(req.body.rsiotp === otp)
  {
    res.render('newphone.hbs');
  }
  // else
  // {
  //   res.send('error');
  // }
});

//  =============== verification of RSI ID =====================
app.post('/myfront',function(req,res){
   user=req.body.rsiid;
   auth.idVerify(user)
   .then(()=>{
     res.render('myregister.hbs');
   }, ()=>{
     console.log('error in verifying ID');
   });
});

// =============== mobile number and password authentication =============
app.post('/myregister',function(req,res){
	mob=req.body.mobNo;
	var password=req.body.rsipass;
   auth.authenticate(user,mob,password)
   .then(()=>{
     res.render('index.hbs');
   }, ()=>{
     console.log('error in mobile number authentication');
   });
   //res.render('myregister.hbs');
});

const server = app.listen(process.env.PORT || 5000);


