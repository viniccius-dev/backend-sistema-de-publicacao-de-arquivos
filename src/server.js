const express = require("express");

(async () => {
    const app = express();

    app.use(express.json());

    const PORT = 3333;
    app.listen(PORT, () => console.log(`Server is running ${PORT}`));
})();