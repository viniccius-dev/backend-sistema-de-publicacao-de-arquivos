exports.up = knex => knex.schema.createTable("attachments", table => {
    table.increments("id");
    table.text("name");
    table
    .enum("type", ["main", "subattachments"], { useNative: true, enumName: "type" })
    .notNullable();

    table.text("attachment");
    table.integer("publication_id").references("id").inTable("publications").onDelete("CASCADE").notNullable();
    table.integer("domain_id").references("id").inTable("domains").onDelete("CASCADE").notNullable();
});

exports.down = knex => knex.schema.dropTable("attachments");