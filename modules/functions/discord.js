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
//let client = await module.exports.ConnectDiscord
console.log(client)
 console.log("called send message" + defaultchannel + message)
 //sends message to channel, if not channel is defined it will use the default chan definied in the vars.
   if(typeof channelid === "undefined"){
    var channelid = defaultchannel
   }

  	let channel = await client.channels.cache.get(channelid)
  	console.log(channel)
  	if(typeof channel === "undefined"){
  		let connect = await module.exports.ConnectDiscord()
  		console.log(connect)
  		let channel = await client.channels.cache.get(channelid)
  		console.log(channel)
  	}
  	console.log("message sent" + message)
   console.log(await channel.send(message))
	//const channel = client.channels.fetch(channelid).send(message);
	//console.log(channel.send("test message"));
	//console.log(await channel.send(message));
}

}
client.login(discordConfig.token);