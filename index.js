/* 	Stalk Trading Bot index.js
	Written April 2020 by David Maciel
	This file should not be modified if you are just running the bot. 
*/

require('dotenv').config();
const config = require('./config');
const sheetUpdates = require('./sheetFuncs');
const fs = require('fs');

let users = [];
const maintenanceMode = false;

fs.exists('users.json', function(exists) {
	if(exists) {
		fs.readFile('users.json', function loadUsersCallback(err, data) {
			if(err) {
				console.log(err);
			} else {
				users = JSON.parse(data);
			}
		})
	}
});

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
	var canRun = false;
	if(!config.maintenanceMode) {
		canRun = true;
	} else {
		if(config.admins.includes(message.author.id)) {
			canRun = true;
		}
	}
	if(canRun) {
		var msgArr = message.content.split(" ");
		if(msgArr[0].charAt(0) == config.prefix) {
			var command = msgArr[0].substr(1).toLowerCase();
			msgArr.shift();
			var args = msgArr;
			switch(command) {
				case "register":
					/* Register user will assign the user's Discord ID to their respective sheet name. They must enter their sheet name as an argument.
					   Example: '<register crazy' will register the sender's Discord ID to the 'crazy' sheet. */
					registerUser(message, args);
					break;
				case "link":
					message.channel.send(`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit?usp=sharing`);
					break;
				case "update":
					/* Updating their daily prices takes two arguments: AM/PM and the price. */
					updateUser(message, args);
					break;
				case "paid":
					/* Updating the price they paid for turnips only takes the price as an argument. */
					userPaid(message, args);
					break;
				case "reset":
					/* Command does not currently take any arguments but the args are passed anyways to ease future updates. */
					resetWeek(message, args);
					break;
			}
		}
	}
});

function resetWeek(message, args) {
	if(config.admins.includes(message.author.id)) {
		var d = new Date();
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var newWeek = `${months[d.getMonth()]} ${d.getDate()}`;
		for(const id in users) {
			var user = users[id]['name'];
			var range = `${user}!B3`;
			let values = [ [ newWeek ], ];
			var resource = { values, };
			var valueInputOption = "USER_ENTERED";
			sheetUpdates.updateSpreadsheet(message, range, resource, valueInputOption);
			range = `${user}!C6:C17`;
			values = [ [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], [ "", ], ];
			resource = { values, };
			sheetUpdates.updateSpreadsheet(message, range, resource, valueInputOption);
		}
	}
}

function userPaid(message, args) {
	var exists = false;
	var author = message.author.id;
	var user = "";
	for(const id in users) {
		if(users[id]['id'] == message.author.id) {
			user = users[id]['name'];
			islandName = users[id]['island'];
			exists = true;
		}
	}
	if(exists) {
		if(!isNaN(parseInt(args[0]))) {
			var price = `${args[0]}`;
			var range = `${user}!D3`;
			let values = [ [ price ], ];
			var resource = { values, };
			var valueInputOption = "USER_ENTERED";
			sheetUpdates.updateSpreadsheet(message, range, resource, valueInputOption);
		} else {
			message.channel.send("Sorry, the price needs to be a number. Try again or contact Crazy.");
		}
	}
}

function updateUser(message, args) {
	var exists = false;
	var author = message.author.id;
	var user = "", islandName = "";
	for(const id in users) {
		if(users[id]['id'] == message.author.id) {
			user = users[id]['name'];
			islandName = users[id]['island'];
			exists = true;
		}
	}
	if(exists) {
		var reset = args[0].toLowerCase();
		if(reset == "am") {
			resetTime = "8am reset";
		} else if (reset == "pm") {
			resetTime = "12pm reset";
		} else {
			message.channel.send("You forgot what reset you're updating!");
			return;
		}
		if(!isNaN(parseInt(args[1]))) {
			var d = new Date();
			var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var day = days[d.getDay()];
			if(day != "Sunday") {
				var date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
				var price = args[1];
				message.channel.send(`\`\`\`${user} -> ${day}, ${date}, ${resetTime} - ${islandName} - ${price} bells per turnip!\`\`\``);

				var ranges = {
					Monday: ["C6", "C7"],
					Tuesday: ["C8", "C9"],
					Wednesday: ["C10", "C11"],
					Thursday: ["C12", "C13"],
					Friday: ["C14", "C15"],
					Saturday: ["C16", "C17"]
				};

				var rangeIndex = {
					am: 0,
					pm: 1
				}
				var range = `${user}!${ranges[day][rangeIndex[reset]]}`;

				let values = [
					[
						price
					],
				];

				var resource = {
					values,
				};

				var valueInputOption = "USER_ENTERED";

				sheetUpdates.updateSpreadsheet(message, range, resource, valueInputOption);
			} else {
				message.channel.send("You can't sell turnips on a Sunday you dweeb.");
			}
		} else {
			message.channel.send("Sorry, the sell price needs to be a number. Please try again or contact Crazy.");
		}
	} else {
		message.channel.send("You are not a registered user.");
	}
}

function registerUser(message, args) {
	if(config.allowedUsers.includes(args[0])) {
		var exists = false;
		for(const id in users) {
			if(users[id]['name'] == args[0]) {
				exists = true;
			}
			if(users[id]['id'] == message.author.id) {
				exists = true;
			}
			console.log('Existing user attempted to register.');
		};
		if(exists) {
			message.channel.send("You are already registered. Please message Crazy if this is an error.");
		} else {
			var thisName = args[0];
			args.shift();
			isleName = args.join(" ");
			users.push({name: thisName, id: message.author.id, island: isleName});
			message.channel.send(thisName+" has been registered to user ID "+message.author.id+" with island name "+isleName);
			let json = JSON.stringify(users);
			fs.writeFile('users.json', json, (err) => {
				if(err) throw err;
				console.log('The file has been saved!');
			});
		}
	} else {
		message.channel.send("You are not currently on the sheet. Please message Crazy or Walker to request to be added.");
	}
}

client.login(process.env.token);