const AppError = require("../utils/AppError");

function verifyUserAuthorization() {
    return (request, response, next) => {
        const { role } = request.user;

        if(role !== 'admin') {
            throw new AppError("Não autorizado", 401);
        };

        return next();
    };
};

module.exports = verifyUserAuthorization;