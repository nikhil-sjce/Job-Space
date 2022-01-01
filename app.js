const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const path = require("path");
const mysql = require('mysql');
const isAuthenticated = false;
const md5 = require('md5');
require('dotenv').config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var myConnection = mysql.createConnection({
    host: "bvpspd0l24sdpal9h7fl-mysql.services.clever-cloud.com",
    user: "ulfhcsbangdhtfis",
    password: "80onmpmkdlIpowx9f5mm",
    database: "bvpspd0l24sdpal9h7fl",
    multipleStatements: true
});

myConnection.connect((err)=>{
    if(!err)
    console.log("Successfully connected to database");
    else
    console.log("Connection to database failed");
});

var user = {
  userEmail: "",
  isAuthenticated: false,
}

function authenticateUser(email) {
  user.userEmail=email;
  user.isAuthenticated=true;
}

// Authentication
app.get("/auth/signup",(req,res)=>{
    res.sendFile(path.join(__dirname,"./templates/signUp.html"));
});

app.post("/auth/signup",(req,res)=>{
    const name = req.body.signupName;
    const email = req.body.signupEmail;
    const password = md5(req.body.signupPassword);

    var checkQ = "Select name from job_seeker_profile where email='"+email+"'";
    myConnection.query(checkQ,(err,rows)=>{
      if(!err)
        {
          if(rows.length!=0)
            res.send("<h1>USER ALREADY EXITS</h1>");
          else
          {
            var insertQ = "INSERT INTO job_seeker_profile VALUES('"+email+"','"+password+"',NULL,NULL,NULL,'"+name+"',NULL)";
            myConnection.query(insertQ,(err, rows, fields)=>{
              if(!err){
                console.log(rows);
                authenticateUser(email); 
                res.send("<h1>ACCOUNT SUCCESSFULLY CREATED</h1>")
              }
              else
                console.log(err)
            });
          }
        }
      else
        console.log(err);
    });

});

app.post("/auth/signin",(req,res)=>{
  const email = req.body.signinEmail;
  const password = md5(req.body.signinPassword);

  var signInQ = "Select *from job_seeker_profile where email='"+email+"' && password='"+password+"'";
  myConnection.query(signInQ,(err,rows,fields)=>{
    if(!err){
      if(rows.length==0)
        res.send("<h1>INVALID CREDENTIALS</h1><br><a>TRY AGAIN</a>");
      else
      {
        res.send("<h1>YOU HAVE SUCCESSFULLY SIGNED IN</h1>");
        authenticateUser(email);
      }
    }
    else
      console.log(err);
  })

});
// JOB Listing
app.get("/job_listing",(req,res)=>{
    if(user.isAuthenticated)
    {
        myConnection.query('select job_post.job_profile, job_post.job_description, job_post.apply_by, job_post.location, job_post.salary, Company.C_name from job_post inner join Company on job_post.j_id = Company.c_id', (err, rows, fields)=>{
        if(!err){
          console.log(rows);
          res.render("joblisting", {
            rows: rows
          });
        }
        else{
          console.log(err);
        }
      });
    }
    else
    res.send("</h1>NOT SIGNNED IN</h1>");
});

// Filling Student details into Database
app.get("/StudentForm",(req,res)=>{
    if(user.isAuthenticated)
    {
      res.sendFile(path.join(__dirname,"./templates/StudentForm.html"));
    }
    else
      res.send("</h1>NOT SIGNNED IN</h1>");
});

app.post("/StudentForm",(req,res)=>{
  if(user.isAuthenticated)
  {
    console.log(req.body);
    const sqlQuery1 = "INSERT INTO education (degree, major, university, cgpa, percent, batch) VALUES('"+req.body.degree+"', '"+req.body.major+"','"+req.body.university+"', '"+req.body.cgpa+"', '"+req.body.percentage+"', '"+req.body.batch+"')";
    myConnection.query(sqlQuery1, function(err,result){
      if(err)
        console.log(err);
      else {
        console.log("Data inserted in Education Table!");
      }
    });
    const sqlQuery2 = "INSERT INTO Experience (current_job, company_name, start_date, end_date, location) VALUES('"+req.body.curr_job+"', '"+req.body.comp_name+"','"+req.body.start_d+"', '"+req.body.end_d+"', '"+req.body.loc+"')";
    myConnection.query(sqlQuery2, function(err, result){
      if(err){
        console.log(err);
      }else{
        console.log("Data inserted into Experience table!!");
      }
    });
    const sqlQuery3 = "INSERT INTO skill_set (skill_set_name, cv) VALUES ('"+req.body.skill+"', '"+req.body.cv+"')";
    myConnection.query(sqlQuery3, function(err,result){
      if(err){
        console.log(err);
      }else{
        console.log("Data inserted into skill_set table");
      }
    });
  }
});

app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/templates/rootPage.html");
})

app.listen(3000,()=>{
    console.log("Server up and running successfully at port 3000");

})

