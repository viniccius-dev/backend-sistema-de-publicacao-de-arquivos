const fs = require("fs");
const { google } = require("googleapis");
const axios = require("axios");

class GoogleDriveService {
  constructor() {
    const credentials = JSON.parse(fs.readFileSync("src/configs/oauth_credentials.json"));
    const tokens = JSON.parse(fs.readFileSync("src/configs/tokens.json"));

    const { client_id, client_secret, redirect_uris } = credentials.web;

    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[1]
    );

    this.oAuth2Client.setCredentials(tokens);

    // Atualização automática de tokens
    this.oAuth2Client.on("tokens", (newTokens) => {
      const updated = { ...tokens, ...newTokens };
      fs.writeFileSync("src/configs/tokens.json", JSON.stringify(updated, null, 2));
    });
  }

  async uploadLargeFile(filePath, fileName) {
    const fileSize = fs.statSync(filePath).size;

    const token = await this.oAuth2Client.getAccessToken();

    // 1) Criar sessão de upload
    const sessionRes = await axios.post(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        name: fileName,
        parents: ["193cm4Lm7h_chDsSq2yIuVElF2zYx8b-6"]
      },
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    const uploadUrl = sessionRes.headers.location;
    console.log("Sessão de upload criada:", uploadUrl);

    // 2) Upload em partes
    const chunkSize = 10 * 1024 * 1024; // 10MB por chunk
    let start = 0;
    let uploadedBytes = 0;

    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = fs.createReadStream(filePath, { start, end: end - 1 });

      const contentLength = end - start;
      const contentRange = `bytes ${start}-${end - 1}/${fileSize}`;

      const response = await axios.put(uploadUrl, chunk, {
        headers: {
          "Content-Length": contentLength,
          "Content-Range": contentRange,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 308, // 308 = parcial
      });

      uploadedBytes = end;
      const progress = (uploadedBytes / fileSize) * 100;
      console.log(`Progresso: ${progress.toFixed(2)}%`);

      // Caso termine
      if (response.status === 200 || response.status === 201) {
        console.log("Upload finalizado!");
        return response.data;
      }

      start = end;
    }
  }
}

module.exports = GoogleDriveService;