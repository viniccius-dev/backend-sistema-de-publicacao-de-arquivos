process.env.TZ = "America/Sao_Paulo";

const fs = require("fs");
const knex = require("../database/knex");
const schedule = require("node-schedule");
const GoogleDriveService = require("../services/GoogleDriveService");
const BackupLogsRepository = require("../repositories/BackupLogsRepository");
const DomainsService = require("../services/DomainsService");
const AppError = require("../utils/AppError");

// Função para pegar configuração
async function getBackupFrequency() {
  try {
    const result = await knex("system_settings")
      .where({ key: "backup_frequency" })
      .first();

    return result?.value || "daily";
  } catch (err) {
    console.error("Erro ao consultar frequência de backup:", err);
    return "daily";
  }
};

// Converter valor para cron
function frequencyToCron(frequency) {
  switch(frequency) {
    case "daily": return "0 0 * * *"; // Meia-noite
    case "weekly": return "0 0 * * 0"; // Domingo
    case "monthly": return "0 0 1 * *"; // Dia 1 de cada mês
    default: return "0 0 * * *";
  };
};

async function startBackupJob() {
  console.log("Backup rodando:", new Date().toLocaleString());
  
  const backupLogsRepository = new BackupLogsRepository();
  const frequency = await getBackupFrequency();
  const cronExp = frequencyToCron(frequency);
  const backupName = `backup_${Date.now()}.zip`;

  console.log(`Backup automático ativado`);
  console.log(`Frequência: ${frequency}`);
  console.log("Aguardando próximo agendamento...\n");

  schedule.scheduleJob(cronExp, async () => {

    let zipPath = null;

    try {
      const domainsService = new DomainsService();
      const drive = new GoogleDriveService();

      zipPath = await domainsService.exportDatabaseAndAttachments({
          triggerType: "Automatic"
      });

      if (!fs.existsSync(zipPath)) {
        console.error("Arquivo ZIP não encontrado:", zipPath);
        return;
      }
      
      // Pega o tamanho do arquivo final
      const stats = fs.statSync(zipPath);
      const fileSize = stats.size;

      const result = await drive.uploadLargeFile(zipPath, backupName);
      
      // Log de sucesso
      await backupLogsRepository.createLog({
          action_type: 'Exportação',
          trigger_type: 'Automático',
          status: 'Sucesso',
          file_name: backupName,
          file_size: fileSize,
          message: 'Exportação concluída com sucesso.'
      });

      console.log("Backup enviado com sucesso! ID:", result.id);
    } catch (err) {
      console.error("Erro ao executar backup:", err);
      
      // Log de erro
      await backupLogsRepository.createLog({
        action_type: 'Exportação',
        trigger_type: 'Automático',
        status: 'Erro',
        file_name: backupName,
        file_size: 0,
        message: `Erro na exportação: ${err.message}`
      });

      throw new AppError("Falha ao exportar o banco de dados.", 500);
    } finally {
      if (zipPath && fs.existsSync(zipPath)) {
        try {
          fs.unlinkSync(zipPath);
        } catch (delErr) {
          console.error("Erro ao deletar ZIP no finally:", delErr);
        }
      }
    }

  });
}

startBackupJob();