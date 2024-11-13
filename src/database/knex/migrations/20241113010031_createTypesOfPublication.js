exports.up = knex => knex.schema.createTable("types_of_publication", table => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("number_title");
    table.text("date_title");
    table.text("description_title");
    table.text("file_title");
});

exports.down = knex => knex.schema.dropTable("types_of_publication");