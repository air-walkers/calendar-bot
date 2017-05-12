'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 8080, () => {
    console.log('Express server listening on port %d in $s mode', server.address().port, app.settings.env);
});

//HTTP POST route to handle slash command
app.post('/', (req, res) => {
  // implement your bot here ...
  let text = req.body.text;
  let data = {
    response_type: 'in_channel', //public to the channel
    text: 'test',
    attachments:[
      {
        image_url: 'http://cdn2.sbnation.com/imported_assets/1974127/BaS_2_ECEAAWcA_.jpg'
      }  
    ]
  };
  res.json(data);
});

app.get('/slack/oauth', (req, res) => {
  if (!req.query.code) { // access denied
    res.redirect('');
    return;
  }
  const data = {
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code,
    },
  };

  request.post('https://slack.com/api/oauth.access', data, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      // You are done.
      //get the team info and redirect to the team app management page
      request.post('https://slack.com/api/team.info', {form: {token: process.env.SLACK_OAUTH2_TOKEN}}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          if(JSON.parse(body).error == 'missing_scope') {
            res.send('Calendar Bot has been added to your team!');
          } else {
            let team = JSON.parse(body).team.domain;
            res.redirect(`http://${team}.slack.com/apps/manage`);
          }
        }
      });
      
      //get team list info from Slack API users.list method
      //for now this request is in the authorisation part
      request.post('https://slack.com/api/users.list', {form: {token: process.env.SLACK_OAUTH2_TOKEN}}, (error, response, body) => {
      /*Apps created after January 4th, 2017 must request both the users:read and users:read.email 
      OAuth permission scopes when using the OAuth app installation flow to enable access to the email field
      of user objects returned by this method.*/    
          let membersList = JSON.parse(body);
          membersList.members.forEach((member)=>{
          //the emailaddress is in the profile object for every user
            console.log(member.profile.email);
          });
      });
    }
  });
});