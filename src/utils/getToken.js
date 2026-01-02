const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const credentials = JSON.parse(fs.readFileSync("src/configs/oauth_credentials.json"));

const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);


// SCOPES NECESSÁRIOS
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("Abra este link no navegador:");
console.log(authUrl);

// input do código
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Cole o código aqui: ", async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log("Tokens gerados:");
  console.log(tokens);

  fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));

  rl.close();
});
