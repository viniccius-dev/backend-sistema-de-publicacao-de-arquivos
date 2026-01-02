exports.up = knex => knex.schema.createTable("backup_logs", table => {
    table.increments("id");
    table
    .enum("action_type", ["Exportação", "Importação"], { useNative: true, enumName: "action_types" })
    .notNullable();
    table
    .enum("trigger_type", ["Manual", "Automático"], { useNative: true, enumName: "trigger_types" })
    .notNullable();
    table
    .enum("status", ["Sucesso", "Erro"], { useNative: true, enumName: "status" })
    .notNullable();;
    table.text("file_name");
    table.integer("file_size");
    table.text("message");

    table.timestamp("created_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("backup_logs");