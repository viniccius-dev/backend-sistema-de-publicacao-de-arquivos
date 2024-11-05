exports.up = knex => knex.schema.createTable("users", table => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("email").notNullable();
    table.text("password").notNullable();
    table.integer("domain_id").references("id").inTable("domains").onDelete("CASCADE");

    table
    .enum("role", ["admin", "common"], { useNative: true, enumName: "roles" })
    .notNullable().default("common");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("users");