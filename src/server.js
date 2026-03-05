const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const intentionsRouter = require('./routes/intentions');
const ordersRouter = require('./routes/orders');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/intentions', intentionsRouter.router);
app.use('/api/orders', ordersRouter.apiRouter);

app.get('/', (req, res) => {
  res.redirect('/orders');
});

app.use('/intentions', intentionsRouter.viewRouter);
app.use('/orders', ordersRouter.viewRouter);

const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Servidor escuchando en http://${host}:${port}`);
});

