import cors from 'cors'
import express from 'express'
import { createJSONDB } from "./db/json.js"
import { fetchMissingPairs, fetchNewPairs } from './services/pairs.js'
import { fetchPairUpdates } from "./services/swaps.js"

const app = express()

app.use(cors()) // handle cross origin request

var pairDB;
var swapDB;

app.get('/', (req, res) => {
  res.send('Sudoswap App!')
})

app.get("/pairs", async (req, res) => {
  res.json(await pairDB.getAll() || []);
})

app.get("/swaps", async (req, res) => {
  res.json(await swapDB.getAll() || []);
})

await (async () => {
  pairDB = await createJSONDB("./data/pairs.json")
  swapDB = await createJSONDB("./data/swaps.json")
  await fetchMissingPairs(pairDB)
  fetchNewPairs(pairDB) // subscribe
  fetchPairUpdates(pairDB, swapDB)
})()


const host = '0.0.0.0'
const port = 8000
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
})
