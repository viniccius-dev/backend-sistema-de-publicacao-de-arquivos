process.env.TZ = "America/Sao_Paulo";

const fs = require("fs");
const knex = require("../database/knex");
const schedule = require("node-schedule");
const GoogleDriveService = require("../services/GoogleDriveService");
const BackupLogsRepository = require("../repositories/BackupLogsRepository");
const DomainsService = require("../services/DomainsService");
const AppError = require("../utils/AppError");

// Estado do agendamento atual.
// Mantido em escopo de módulo para permitir cancelamento e re-criação
// quando a frequência for alterada via painel administrativo.
let currentJob = null;
let currentFrequency = null;

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
}

// Converter valor para cron
function frequencyToCron(frequency) {
  switch (frequency) {
    case "daily": return "0 0 * * *";   // Meia-noite
    case "weekly": return "0 0 * * 0";  // Domingo
    case "monthly": return "0 0 1 * *"; // Dia 1 de cada mês
    default: return "0 0 * * *";
  }
}

// Callback de execução do backup (extraído pra permitir reuso entre
// agendamento inicial e reagendamentos via API)
async function executeBackupJob() {
  const backupLogsRepository = new BackupLogsRepository();
  const backupName = `backup_${Date.now()}.zip`;

  let zipPath = null;

  try {
    const domainsService = new DomainsService();
    const drive = new GoogleDriveService();

    // exportDatabaseAndAttachments retorna objeto { zipPath, fileName, fileSize, expiresAt }
    // desde a Caixa 2.2. Para o fluxo automático, só usamos zipPath.
    const exportResult = await domainsService.exportDatabaseAndAttachments({
      triggerType: "Automatic"
    });
    zipPath = exportResult.zipPath;

    if (!fs.existsSync(zipPath)) {
      console.error("Arquivo ZIP não encontrado:", zipPath);
      return;
    }

    const stats = fs.statSync(zipPath);
    const fileSize = stats.size;

    const result = await drive.uploadLargeFile(zipPath, backupName);

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
}

/**
 * Registra um novo agendamento com a frequência informada.
 * O job antigo só é cancelado APÓS o novo ser criado com sucesso,
 * garantindo zero janela sem agendamento ativo.
 */
function scheduleBackupJob(frequency) {
  const cronExp = frequencyToCron(frequency);
  const newJob = schedule.scheduleJob(cronExp, executeBackupJob);

  if (!newJob) {
    throw new Error(`Falha ao criar agendamento com expressão cron: ${cronExp}`);
  }

  if (currentJob) {
    currentJob.cancel();
  }

  currentJob = newJob;
  currentFrequency = frequency;

  return cronExp;
}

/**
 * Inicializa o agendamento no boot do processo.
 */
async function startBackupJob() {
  console.log("[Backup] Agendamento inicializado:", new Date().toLocaleString());

  const frequency = await getBackupFrequency();
  const cronExp = scheduleBackupJob(frequency);

  console.log(`[Backup] Automático ativado`);
  console.log(`[Backup] Frequência: ${frequency} (${cronExp})`);
  console.log("[Backup] Aguardando próximo agendamento...\n");
}

/**
 * Reagenda o backup com a frequência mais recente do banco.
 *
 * Comportamento de falha (aberto):
 * - Se a leitura do banco ou a criação do novo job falhar,
 *   o agendamento atual é mantido intacto e o erro é logado.
 *
 * @returns {Promise<boolean>} true se reagendou, false caso contrário
 */
async function rescheduleBackupJob() {
  try {
    const oldFrequency = currentFrequency;
    const newFrequency = await getBackupFrequency();

    if (oldFrequency === newFrequency) {
      console.log(`[Backup] Reagendamento solicitado, mas frequência não mudou (${newFrequency}). Nenhuma ação tomada.`);
      return true;
    }

    const oldCronExp = oldFrequency ? frequencyToCron(oldFrequency) : "n/a";
    const newCronExp = scheduleBackupJob(newFrequency);

    console.log(`[Backup] Reagendado: ${oldFrequency} (${oldCronExp}) → ${newFrequency} (${newCronExp})`);
    return true;
  } catch (error) {
    console.error(
      "[Backup] Falha ao reagendar. Mantendo agendamento atual em memória.",
      error
    );
    return false;
  }
}

startBackupJob();

module.exports = { rescheduleBackupJob };