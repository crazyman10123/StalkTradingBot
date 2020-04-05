require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
//UPDATE THE SPREADSHEET ID HERE TOO
const spreadsheetId = "";

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}

module.exports = {
	updateSpreadsheet: function(message, range, resource, valueInputOption) {
		fs.readFile('credentials.json', (err, content) => {
			if(err) return console.log('Error loading client secret file:' , err);
			var creds = JSON.parse(content);
			var {client_secret, client_id, redirect_uris} = creds.installed;
			var oAuth2Client = new google.auth.OAuth2(
				client_id, client_secret, redirect_uris[0]);
			fs.readFile(TOKEN_PATH, (err, token) => {
				if (err) return getNewToken(oAuth2Client);
				oAuth2Client.setCredentials(JSON.parse(token));
				var sheets = google.sheets({version: 'v4', auth: oAuth2Client});
				sheets.spreadsheets.values.update({
					spreadsheetId,
					range,
					valueInputOption,
					resource,
				}, (err, result) => {
					if(err) {
						console.log(err);
						message.channel.send("An error occurred. Please contact an admin.");
					} else {
						var rangeSplit = range.split('!');
						console.log(`${rangeSplit[0]} updated the spreadsheet at ${rangeSplit[1]} with the value ${resource.values}`);
						message.channel.send("The spreadsheet has been updated. Thank you!");
					}
				});
			});
		});
	}
}