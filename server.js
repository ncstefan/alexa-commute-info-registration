//Copyright 2013-2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//Licensed under the Apache License, Version 2.0 (the "License"). 
//You may not use this file except in compliance with the License. 
//A copy of the License is located at
//
//    http://aws.amazon.com/apache2.0/
//
//or in the "license" file accompanying this file. This file is distributed 
//on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
//either express or implied. See the License for the specific language 
//governing permissions and limitations under the License.

//Get modules.
var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var AWS = require('aws-sdk');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(favicon(path.join(__dirname, 'public','images','favicon.ico'))); 
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true})); // get data from a POST method
app.use(bodyParser.json());
app.use(methodOverride());
//app.use(app.router);

//Read config values from a JSON file.
var config = fs.readFileSync('./app_config.json', 'utf8');
config = JSON.parse(config);

//Create DynamoDB client and pass in region.
var db = new AWS.DynamoDB({region: config.AWS_REGION});
//Create SNS client and pass in region.
var sns = new AWS.SNS({ region: config.AWS_REGION});

//GET home page.
app.get('/', routes.index);

//GET privacy policy page
app.get('/privacy', routes.privacy);

//POST signup form.
app.post('/signup', function(req, res) {
  var alxIDField = req.body.alxid,
      alxAddressField = req.body.alxaddress;
    var namemap= [];

  if (req.body.name1 && req.body.address1){
    namemap.push({
      'M' : {
        Name: {'S': req.body.name1},
        Address: {'S': req.body.address1}
      }
    });
  } 
  if (req.body.name2 && req.body.address2){
    namemap.push({
      'M' : {
        Name: {'S': req.body.name2},
        Address: {'S': req.body.address2}
      }
    });
  } 
  if (req.body.name3 && req.body.address3){
    namemap.push({
      'M' : {
        Name: {'S': req.body.name3},
        Address: {'S': req.body.address3}
      }
    });
  } 
  if (req.body.name4 && req.body.address4){
    namemap.push({
      'M' : {
        Name: {'S': req.body.name4},
        Address: {'S': req.body.address4}
      }
    });
  } 

  res.sendStatus(200);
  signup(alxIDField, alxAddressField, namemap);
});

//moved after GET & POST as per 3.4 -> 4.x migration instructions (router methods are added in order of which they appear)
app.use(express.static(path.join(__dirname, 'public'))); //??not needed -> configured @ aws:elasticbeanstalk:container:nodejs:staticfiles
app.locals.theme = process.env.THEME; //Make the THEME environment variable available to the app. 

//Add signup form data to database..
var signup = function (alxID, alxAddress, namemap) {
  var formData = {
    TableName: config.STARTUP_SIGNUP_TABLE,
    Item: {
      alxID: {'S': alxID}, 
      alexaLocation: {'S': alxAddress},
      names: {'L': namemap}
    }
  };
  console.log("db update:\n" + JSON.stringify(formData));
  db.putItem(formData, function(err, data) {
    if (err) {
      console.log('Error adding item to database: ', err);
    } else {
      console.log('Form data added to database.');
      var snsMessage = 'New signup: %EMAIL%'; //Send SNS notification containing email from form.
      snsMessage = snsMessage.replace('%EMAIL%', formData.Item.alxID);
      sns.publish({ TopicArn: config.NEW_SIGNUP_TOPIC, Message: snsMessage }, function(err, data) {
        if (err) {
          console.log('Error publishing SNS message: ' + err);
        } else {
          console.log('SNS message sent.');
        }
      });  
    }
  });
};

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
