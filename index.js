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
//gcp.serveraction("minecraftftb1","start")
}


// Listen for messages
client.on("message", async (message) => {

  const userMessage = message.content;
  console.log("user message" + userMessage)
  if (userMessage.startsWith("!server")) {
    const code =
      userMessage.split(" ")[1] == null ? "" : userMessage.split(" ")[1].trim();

    if (code.length == 0 || code == null || code == "") {
      discord1.sendMessage("I think you've missed something", userMessage.channel_id)
    }

    let codelower = code.toLowerCase()
    let output;
    const servername =
    userMessage.split(" ")[2] == null ? "" : userMessage.split(" ")[2].trim();
    switch(codelower) {
      case "list":
        output = await gcp.getserverslist();
        discord1.sendMessage(output, userMessage.channel_id)
        break;
      case "status":
        output = await gcp.getserversstatus(servername);
        discord1.sendMessage(output, userMessage.channel_id)
        break;
      case "start":
      case "stop":
        output = await gcp.serveraction(servername, codelower);
        break;
      default:
        discord1.sendMessage("Couldn't find an action that meets your request...try again later.", userMessage.channel_id)
    }
  }
});

// Login
client.login(discordConfig.token);

load()
