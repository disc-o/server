const express = require('express')
const request = require('request')
var cors = require('cors')
const app = express()
var bodyParser = require('body-parser')
const port = 3001

const nanoid = require('nanoid')

var clients = new Map()
var users = new Map()

app.listen(port, () => console.log(`Disco server listening on port ${port}!`))
app.use(bodyParser.json())
app.use(cors())


app.get('/uid', (req, res) => {
  var uid = nanoid(8)
  // in case uid is not unique
  while (clients[uid] != undefined) {
    uid = nanoid(8)
  }
  clients[uid] = req.query.callback
  console.log(clients[uid])
  res.send({ uid: uid });
})

app.post('/uid', (req, res) => {
  var uid = req.body.uid
  if (clients[uid] == undefined) {
    console.log(failed);
    res.status(400).send('failed')
  } else {
    console.log('sending to ' + clients[uid])
    var options = {
      uri: clients[uid],
      method: 'POST',
      json: true,
      body: {
        'proxy_url': req.body.proxy_url
      }
    }
    request(options, (err, resq, body) => { })
    res.send('success');
  }
})

