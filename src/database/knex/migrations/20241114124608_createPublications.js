exports.up = knex => knex.schema.createTable("publications", table => {
    table.increments("id");
    table.text("number");
    table.date("date");
    table.text("description");

    table.integer("domain_id").references("id").inTable("domains").onDelete("CASCADE");
    table.integer("type_of_publication_id").references("id").inTable("types_of_publication");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("publications");