/* 	Stalk Trading Bot config.js
	Written April 2020 by David Maciel
	This file should be modified to have the appropriate settings for your server.
	On top of creating settings here, you need to create a file named ".env" that contains "token=[discord bot token]" where you replace [discord bot token] with the token you get after creating an app through Discord's developer panel.
	You also need to follow Google's node.js quickstart for Google sheets API guide to give your bot access to the spreadsheet.
*/

const config = {
	//The prefix for commands. Default is < because it isn't used by many other bots.
	prefix: '<',
	
	//Admins can be added by adding their user IDs to this array.
	admins: [
		''
	],
	
	//Users can be added by adding their names to this array. These names should match the sheet names in the spreadsheet.
	allowedUsers: [
		"",
		"",
		""
	],
	
	//This is the spreadsheet ID from Google Docs. This is found in the URL of the spreadsheet.
	spreadsheetId: "",
	
	//Maintenance mode restricts access to admins.
	maintenanceMode: false
}

module.exports = config;