'use strict';

const Compute = require("@google-cloud/compute");
const gcpConfig = require("./GCP_config.json");
const compute = new Compute({
  projectId: gcpConfig.project_id,
  keyFilename: "./GCP_config.json",
});

// Global vars
let serverInstance;
let metadataServerInstance;
let statusServerInstance;

//load custom discord functions
const discord = require('./discord.js')
//var head = `☀️Air Quility ${time}☁️\n`
//var body = ""

function delay(t, v) {
   return new Promise(function(resolve) { 
       setTimeout(resolve.bind(null, v), t)
   });
}


module.exports = {

getserverslist: async function(){
	let head = '\n🖥List of Servers🖥\n'
	let body = ""
	let message = ""
	const [vms] = await compute.getVMs();
	vms.forEach((vm,index,array) => {body += vm.name +' -- '+ vm.metadata.status +' -- ' + vm.metadata.networkInterfaces[0].accessConfigs[0].natIP + '\n'})
	  
	message += head + body
	return(message)
},

//gets the status of a filtered server
getserversstatus: async function(servername){
	//console.log(servername)
	let head = '\n🖥Server Status🖥\n'
	let body = ""
	let message = ""
	
	let options = {
    filter: `name eq ${servername}`
  	}

	const [vm] = await compute.getVMs(options);
	if(vm[0].metadata.status === "RUNNING"){
		body += vm[0].name +' -- '+ vm[0].metadata.status +' -- ' + vm[0].metadata.networkInterfaces[0].accessConfigs[0].natIP + '\n'
	}
	else{
		body += vm[0].name +' -- '+ vm[0].metadata.status + '\n'
	}

	message += head + body
	return(message)

},

//start server by name
startserver: async function(servername,resolve,reject){
	let message = ""
	let options = {
    filter: `name eq ${servername}`
  	}
  	let [vm] = await compute.getVMs(options);
//check status
if(vm[0].metadata.status === "RUNNING"){
	console.log("in server start section")
	message = vm[0].name +' -- '+ vm[0].metadata.status +' -- ' + vm[0].metadata.networkInterfaces[0].accessConfigs[0].natIP + '\n'
	return Promise.resolve(message)
}
if(vm[0].metadata.status === "TERMINATED"){
	 return new Promise((resolve,reject) => vm[0].start()
    .then(response => {
    	console.log(response)
    	return new Promise((resolve, reject) => {
    		module.exports.getserversstatus(vm[0].name)
    		.then(statusmessage => {
    			console.log(statusmessage)
    			module.exports.startserveripmessage(vm[0].name)
    			return resolve(statusmessage)
    		});

    	})
      })
    )
	}
},

startserveripmessage: function(servername){
	return new Promise((resolve,reject) => module.exports.getserversstatus(servername)
	.then(response => {
		console.log("looking for server ip" + response)

		if(response.split(" -- ").length > 2){
			console.log(response + "greater than 2")
			resolve(discord.sendMessage(response))
			//resolve()
		}
		else{console.log("running again")
			return delay(3000).then(function() {
				module.exports.startserveripmessage(servername).then(resolve)
			})
			
		}
	})
	)

}




}
