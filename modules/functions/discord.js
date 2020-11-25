'use strict';
const Discord = require("discord.js");
const discordConfig = require("./discord-config.json");
const client = new Discord.Client();


let defaultchannel = "711773120330989620"

module.exports = {

ConnectDiscord: async function(resolve){
	let readymessage = await client.once("ready", async () => {
		
	})

	return Promise.resolve("Bot is ready")
},

//sends message to channel, if not channel is defined it will use the default chan definied in the vars.
sendMessage: async function(message,channelid){
 console.log("called send message" + defaultchannel + message)
 //sends message to channel, if not channel is defined it will use the default chan definied in the vars.
   if(typeof channelid === "undefined"){
    var channelid = defaultchannel
   }
   console.log(client)
	const channel = client.channels.cache.get(defaultchannel);
	//console.log(channel.send("test message"));
	console.log(channel.send(message));
}

}
client.login(discordConfig.token);