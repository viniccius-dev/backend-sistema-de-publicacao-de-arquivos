exports.up = knex => knex.schema.createTable("system_settings", table => {
    table.increments("id");
    table.text("key").unique().notNullable();
    table.text("value").notNullable();

    table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("system_settings");