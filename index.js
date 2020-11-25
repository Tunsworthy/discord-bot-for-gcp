// Imports
const Discord = require("discord.js");
const Compute = require("@google-cloud/compute");
const discordConfig = require("./discord-config.json");
const gcpConfig = require("./GCP_config.json");

// Initialize
const client = new Discord.Client();
const compute = new Compute({
  projectId: gcpConfig.project_id,
  keyFilename: "./GCP_config.json",
});

// Global vars
let serverInstance;
let metadataServerInstance;
let statusServerInstance;
let defaultchannel = "711773120330989620"

// Fetch VMs from GCP, async
async function getListOfVMs() {
  const options = {
    maxResults: 3,
  };
  const [vms] = await compute.getVMs(options);
  serverInstance = vms[0];
  metadataServerInstance = serverInstance.metadata;
  statusServerInstance = metadataServerInstance.status;
}

//functions
const gcp = require('./modules/functions/gcp.js')
const discord1 = require('./modules/functions/discord.js')
//const discord = require('./modules/functions/discord.js')



async function load(){
  let start = await discord1.ConnectDiscord();
  console.log("Bot Started")
//discord1.sendMessage("Bot has started")
//gcp.startserver("minecraftftb1-2")
}

load()




// Listen for messages
client.on("message", async (message) => {
  const userMessage = message.content;

  if (userMessage.startsWith("!server")) {
    const code =
      userMessage.split(" ")[1] == null ? "" : userMessage.split(" ")[1].trim();

    if (code.length == 0 || code == null || code == "") {
      message.channel.send(
        "Umm, you were supposed to type `!server start` or `!server stop`"
      );
      message.channel.send(
        "You can also type `!server status` to get the current status of the server"
      );
    }

   let codelower = code.toLowerCase()

   if(codelower == "list"){
    const output = await gcp.getserverslist();
    message.channel.send(output);
   }

   if(codelower == "status"){
    const servername =
      userMessage.split(" ")[2] == null ? "" : userMessage.split(" ")[2].trim();
    const output = await gcp.getserversstatus(servername);
    console.log(output)
    message.channel.send(output);

   }
   if(codelower == "start2"){
    const servername =
      userMessage.split(" ")[2] == null ? "" : userMessage.split(" ")[2].trim();
    const output = await gcp.startserver(servername);
    console.log(output)
    message.channel.send(output);

   }




    await getListOfVMs();

    const [vms] = await compute.getVMs({ maxResults: 3 });
    const status = vms[0].metadata.status;

    
    if (code.toLowerCase() == "status") {

      const paperInstance = vms[0];

      const ip = paperInstance.metadata.networkInterfaces[0].accessConfigs[0].natIP;
      message.channel.send("serverInstance is currently: **" + status + "** IP: **" + ip + "**");
    }

    if (code.toLowerCase() == "start") {

      if (statusServerInstance == "RUNNING") {
        const paperInstance = vms[0];
        const sshCommand =
          'gcloud beta compute ssh --zone "YOUR_ZONE" "serverInstance" --project "YOUR_GCP_PROJECT_NAME"';

        const ip =
          paperInstance.metadata.networkInterfaces[0].accessConfigs[0].natIP;
        message.channel.send("serverInstance running on IP: **" + ip + "**");
        message.channel.send("SSH Command: `" + sshCommand + "`");
      }
      if (statusServerInstance == "TERMINATED") {
        serverInstance.start().then(async (data) => {
          message.channel.send(
            "Provisioning the serverInstance. Run **`!server start`** after a few seconds to get the IP Address."
          );
          message.channel.send(
            "You can also type `!server status` to get the current status of the server"
          );
          statusServerInstance = "RUNNING";
        });
      }
    }

    if (code.toLowerCase() == "stop") {
      if (statusServerInstance == "RUNNING") {
        serverInstance.stop().then((data) => {
          message.channel.send("Server stopped");
        });
      }
      if (statusServerInstance == "TERMINATED") {
        message.channel.send("Server was already stopped");
      }
      statusServerInstance = "TERMINATED";
    }
  }
});

// Login
client.login(discordConfig.token);
