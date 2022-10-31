import cors from 'cors'
import express from 'express'
import { createPairDB, fetchMissingPairs, fetchNewPairs } from './pairdb.js'

const app = express()

app.use(cors()) // handle cross origin request

var db;

app.get('/', (req, res) => {
  res.send('Sudoswap App!')
})

app.get("/pairs", async (req, res) => {
  res.json(await db.getAll());
})

await (async () => {
  db = await createPairDB("./pairdb.json")
  await fetchMissingPairs(db)
  fetchNewPairs(db) // subscribe
})()


const host = '0.0.0.0'
const port = 8001
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
})
