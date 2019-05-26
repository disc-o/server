const express = require('express')
const request = require('request')
const app = express()
var bodyParser = require('body-parser')
const port = 3001

const nanoid = require('nanoid')

var clients = new Map()
var users = new Map()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
app.use(bodyParser.json())


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/uid', (req, res) => {
  var uid = nanoid(8);
  clients[uid] = req.query.callback
  console.log(clients[uid])
  res.send({ uid: uid });
})

app.post('/uid', (req, res) => {
  var uid = req.body.uid
  if (clients[uid] == undefined) {
    res.status(400).send('failed')
  } else {
    var options = {
      uri: clients[uid],
      method: 'POST',
      json: true,
      body: {
        'proxy_url': req.body.proxy_url
      }
    }
    request(options, (err, resq, body) {

    })
    res.send('success');
  }
})

