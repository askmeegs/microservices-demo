"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const port = process.env.PORT || 8080;
const app = new index_1.App().app;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
