const { google } = require("googleapis");
const fs = require("fs");
const axios = require("axios");

class GoogleDriveService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  async uploadLargeFile(filePath, fileName) {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const { token: accessToken } = await this.oauth2Client.getAccessToken();

    // Tamanho do pedaço: 5MB (Deve ser múltiplo de 256KB por exigência do Google)
    const CHUNK_SIZE = 5 * 1024 * 1024; 

    console.log(`Iniciando upload resiliente: ${fileName} (${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB)`);

    try {
      // 1. Solicitar URL de sessão Resumable
      const sessionRes = await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          name: fileName,
          parents: [process.env.GOOGLE_FOLDER_ID],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": "application/zip",
          },
        }
      );

      const uploadUrl = sessionRes.headers.location;
      let start = 0;

      // 2. Loop de envio por pedaços (Chunks)
      while (start < fileSize) {
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const contentLength = end - start;
        
        // Criar um stream apenas para o pedaço atual
        const chunkStream = fs.createReadStream(filePath, { start, end: end - 1 });

        try {
          const response = await axios.put(uploadUrl, chunkStream, {
            headers: {
              "Content-Length": contentLength,
              "Content-Range": `bytes ${start}-${end - 1}/${fileSize}`,
            },
          });

          if (response.status === 200 || response.status === 201) {
            console.log("Upload 100% concluído!");
            return response.data;
          }
        } catch (err) {
          // O Google retorna 308 Resume Incomplete quando o chunk é aceito mas o arquivo não acabou
          if (err.response && err.response.status === 308) {
            start = end;
            const percentage = ((start / fileSize) * 100).toFixed(2);
            console.log(`[Progresso] ${percentage}% enviado...`);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error("Erro crítico no upload estruturado:", err.message);
      throw err;
    }
  }
}

module.exports = GoogleDriveService;