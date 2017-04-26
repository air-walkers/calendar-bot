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
      // If you want to get team info, you need to get the token here
      let token = JSON.parse(body).access_token; // Auth token

      request.post('https://slack.com/api/team.info', {form: {token: token}}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          if(JSON.parse(body).error == 'missing_scope') {
            res.send('Gif has been added to your team!');
          } else {
            let team = JSON.parse(body).team.domain;
            res.redirect(`http://${team}.slack.com/apps/manage`);
          }
        }
      });
    }
  });
});