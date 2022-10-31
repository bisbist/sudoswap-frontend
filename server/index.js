import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Sudoswap App!');
})

const host = '0.0.0.0';
const port = 8001;

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
})

