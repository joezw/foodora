/**
 * Introduction to Human-Computer Interaction
 * Lab 2
 * --------------
 * Created by: Michael Bernstein
 * Last updated: December 2013
 */
var PORT = 3000;

// Express is a web framework for node.js
// that makes nontrivial applications easier to build
var express = require('express');
var Mongoose = require('mongoose');
var sendgrid = require('sendgrid')('app22012679@heroku.com', 'qbx3covj');



// Create the server instance
var app = express();

// Print logs to the console and compress pages we send
///app.use(express.logger());
app.use(express.compress());
app.use(express.bodyParser());

// Return all pages in the /static directory
// whenever they are requested at '/'
// e.g., http://localhost:3000/index.html
// maps to /static/index.html on this machine
app.use(express.static(__dirname + '/static'));

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development
app.listen(port, function() {
	console.log("Node.js server running on port %s", port);
});


///////////////////////////////////////
// Database
///////////////////////////////////////
var mongodb = Mongoose.connect(
    'mongodb://admin:blah12345@troup.mongohq.com:10051/app22012679');

var userAccount = Mongoose.model('Account',
{
    email: {type: String, required: true},
    password: {type: String, required: true}
});






////////////////////////////////////////
// Route Definitions
///////////////////////////////////////
app.post('/login', login);
app.post('/createAccount', createAccount);
app.post('/recoverPass', recoverPass);

////////////////////////////////////
// functions
////////////////////////////////////


function login(request, response)  
{

    var uEmail = request.body.email;
    var uPass = request.body.password;

    userAccount.find(
    {
        email: uEmail,
        password: uPass
        
    }, function (err, acc)
    {

        console.log(acc.length);
        if (err || (acc.length === 0))
        {
            console.log("Invalid user");
            response.sendfile('./static/invalid_password.html');
            return false;
        }
        else
        {
            console.log("Valid user");


            response.sendfile('./static/home.html');

            return true;
        }
    });
}


function recoverPass(request, response)
{
	console.log("did i make it?");
    var uEmail = request.body.email;

    userAccount.find(
    {
        email: uEmail
        
    }, function (err, acc)
    {

        console.log(acc.length);
        if (err || (acc.length === 0))
        {
            console.log("Invalid user");
            //response.sendfile('./static/index.html');
            return false;
        }
        else
        {
            console.log(acc[0].password);
            var emailText = 'Greetings Foodie! This is your password ' + acc[0].password;
            
            sendgrid.send(
            {
                to: uEmail,
                from: 'app22012679@heroku.com',
                subject: 'Foodora Password Recovery',
                text: emailText
            }, function (err)
            {
                if (err)
                {
                    console.log(err);
                }
            });


            response.sendfile('./static/index.html');

            return true;
        }
    });
    /*
    sendgrid.send(
    {
        to: 'joezw.89@gmail.com',
        from: 'app22012679@heroku.com',
        subject: 'Foodora Password Recovery',
        text: 'hello'
    }, function (err)
    {
        if (err)
        {
            console.log(err);
        }
    });
    */
}



function createAccount(request, response)
{
    var uEmail = request.body.email;
    var uPass = request.body.password;
    var success = {
        succeeded: true,
    };
    var failed = {
        succeeded: false,
        error: "Account already exists."
    };
    console.log("Attempting to register account: " + uEmail);

    var checkEmail = validateEmail(uEmail);
    console.log(checkEmail);

    if(checkEmail == false) {

        response.sendfile('./static/err_invalEmail.html');
        return;
    }
    userAccount.count(
    {
        email: uEmail
    }, function (err, acc)
    {
        // If the account doesn't already exist -- create one
        if (err || (acc === 0))
        {
            userAccount.create(
                {

                    email: uEmail,
                    password: uPass
                },
                function (err, acc)
                {
                    if (err)
                    {
                        console.log(
                            "Failed to register account: " +
                            uEmail);
                        response.send(failed);
                        return false;
                    }
                    else
                    {
                        console.log(
                            "Successfully created account: " +
                            uEmail);
                        response.sendfile('./static/succ_AccCreated.html');
                        return true;
                    }
                });
        }
        else
        {
            // Account already exists -- return failed
            console.log("Failed to register account: " +
                uEmail);
            response.sendfile('./static/err_accTaken.html');
            return true;
        }
    });



    return false;

}


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 