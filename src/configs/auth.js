module.exports = {
    jwt: {
        secret: process.env.AUTH_SECRET || "default",
        expiresIn: "8h"
    }
}