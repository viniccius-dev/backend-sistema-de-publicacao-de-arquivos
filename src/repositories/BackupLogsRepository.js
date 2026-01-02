// repositories/BackupLogsRepository.js
const knex = require("../database/knex");

class BackupLogsRepository {
  async createLog({ action_type, trigger_type, status, file_name, file_size, message }) {
    await knex('backup_logs').insert({
      action_type,
      trigger_type,
      status,
      file_name,
      file_size,
      message
    });
  };

  async getBackupLogs(page) {
      const pageSize = 20;

      try {
          // Busca todos os logs primeiro
          const allItems = await knex('backup_logs')
              .orderBy("created_at", "desc");

          // Se página não for informada, retorna tudo
          if (page === undefined || page === null) {
              return allItems;
          }

          const pageNumber = parseInt(page, 10) || 1;
          const totalItems = allItems.length;
          const totalPages = Math.ceil(totalItems / pageSize);
          const offset = (pageNumber - 1) * pageSize;

          // Fatia os resultados
          const paginatedItems = allItems.slice(offset, offset + pageSize);

          return {
              totalItems,
              totalPages,
              currentPage: pageNumber,
              items: paginatedItems
          };

      } catch (error) {
          console.error("Erro ao recuperar logs de backup:", error);
          throw error;
      }
  }
}

module.exports = BackupLogsRepository;
