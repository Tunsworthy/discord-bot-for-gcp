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
	let statusmessage = {}
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

	statusmessage.message = head + body
	statusmessage.vm = vm[0]
	return(statusmessage)

},

//start server by name
serveraction: async function(servername,action,resolve,reject){
	console.log("in server "+ action)
	
	let statusobj = {
		start: "RUNNING",
		stop: "TERMINATED"
	}

	var getProperty = function (propertyName) {
    	return statusobj[propertyName];
	};
	//console.log(getProperty(action))
//get the current server status details
	let statusdetails = await module.exports.getserversstatus(servername)
//console.log(statusdetails.vm )
//Check if server is in desired start - if so respond with status
if(statusdetails.vm.metadata.status === getProperty(action)){
	console.log("Server is already in desired state")
	//let statusmessage = await module.exports.getserversstatus(servername)
	//console.log(statusdetails)
	return Promise.resolve(discord.sendMessage(statusdetails.message))
}

//if the state doesn't match
else{

	let [vm,operation] = await statusdetails.vm[action]()
	discord.sendMessage("command received by GCP - confirmation of Server Satus will be sent shortly... Dave...")
	module.exports.checkoperation(servername,getProperty(action))
	//console.log(`Polling operation ${operation.id}...`);
	//console.log(operation)
   // module.exports.checkoperation(servername,getProperty(action))
   //operation = compute.operation(operation.id)
    //console.log(operation)
  // let opstatus =  await operation.promise();
  // console.log(opstatus)
	//discord.sendMessage("command received by GCP - confirmation of Server Satus will be sent shortly... Dave...")
	//var operation = compute.operation(operationdetails.id);
	// console.log('Acquiring VM metadata...');
  //  const [metadata] = await vm.getMetadata();

	//console.log(operation)

  		//let statusreturn = await module.exports.getserversstatus
		//console.log(discord.sendMessage(statusreturn.message))
			//send to function to check completion
		}
/*
    	})
      })
    )
	}
*/
},

startserveripmessage: function(servername){
	return new Promise((resolve,reject) => module.exports.getserversstatus(servername)
	.then(response => {
		console.log("looking for server ip" + response)

		if(response.split(" - - ")[1] === "RUNNING"){
			console.log(response + "RUNNING")
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

},

checkoperation: function(servername,detect){
	return new Promise((resolve,reject) => module.exports.getserversstatus(servername)
	.then(statusdetails => {
		if(statusdetails.vm.metadata.status === detect){
			discord.sendMessage(statusdetails.message)
		}
		else{
			return delay(3000).then(function() {
				module.exports.checkoperation(servername,detect).then(resolve)
			})
		}

	})
	)
}

}