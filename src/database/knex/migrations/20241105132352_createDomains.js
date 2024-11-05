exports.up = knex => knex.schema.createTable("domains", table => {
    table.increments("id");
    table.text("domain_name").notNullable();
    table.text("url").notNullable();
});

exports.down = knex => knex.schema.dropTable("domains");