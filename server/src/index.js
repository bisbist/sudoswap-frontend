import cors from 'cors'
import helmet from 'helmet'
import express from 'express'
import db from './db/mongo.js'
import config from "./config.js"
import { Pair, fetchPairUpdates } from './services/pairs'



const app = express()

app.use(cors()) // handle cross origin request
app.use(helmet())
app.use(express.json())


app.get("/config", async (req, res) => {
  res.json(config);
})

app.get("/pairs", async (req, res) => {
  res.json(await Pair.find())
})

app.get('/ping/:id', (req, res) => {
  res.send(`Sudoswap App! @ ${req.params.id}`)
})

const main = async () => {
  await db.connect(process.env.MONGODB_URI)

  const host = "0.0.0.0"
  const port = process.env.PORT || "8000"
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`)
  })

  fetchPairUpdates()
}


main()