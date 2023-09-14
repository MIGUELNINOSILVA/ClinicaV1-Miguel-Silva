const express = require('express');
const routeBase = require(`${__dirname}/src/routes/routes.js`);
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/clinica', routeBase);

app.listen(port, ()=>{
  console.log(`Started server on port ${port}`);
});