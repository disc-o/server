const express = require('express')
const request = require('request')
const cors = require('cors')
const bodyParser = require('body-parser')
const nanoid = require('nanoid')
const forge = require('node-forge')
const uuid = require('uuid')

const port = 3001

const app = express()

var client_callback = new Map()
var client_certificate = new Map()
var client_challange = new Map()
var users = new Map()

app.use(bodyParser.json())
app.listen(port, () => console.log(`Disco server listening on port ${port}!`))
app.use(cors())

// For the untrusted client to get proxy_url
app.get('/uid', (req, res) => {
  var uid = nanoid(8)
  // in case uid is not unique
  while (client_callback[uid] != undefined) {
    uid = nanoid(8)
  }
  client_callback[uid] = req.query.callback
  console.log(uid + ': ' + client_callback[uid])
  // Generate the challenge to verify the certificate
  var challenge = nanoid(128)  // can change this to crypto-safe random string generator
  client_challange[uid] = challenge
  var certRaw = req.headers['authorization']
  var cert = forge.pki.certificateFromPem(certRaw)
  client_certificate[uid] = certRaw
  var public_key = cert.publicKey
  res.type('json')
  res.send({ uid: uid, challenge: public_key.encrypt(challenge) })
})

app.post('/uid', (req, res) => {
  var uid = req.body.uid
  console.log(uid)
  if (client_callback[uid] == undefined) {
    console.log('failed');
    res.status(400).send('failed')
  } else {
    console.log('sending to ' + client_callback[uid])
    var options = {
      uri: client_callback[uid],
      method: 'POST',
      json: true,
      body: {
        'proxy_url': req.body.proxy_url,
        'public_key': req.body.public_key
      }
    }
    request(options, (err, resq, body) => { })
    var certRaw = client_certificate[uid]
    var pubKey = forge.pki.certificateFromPem(certRaw).publicKey
    var pubKeyPem = forge.pki.publicKeyToPem(pubKey)
    res.send({ challenge: client_challange[uid], certificate: certRaw, public_key: pubKeyPem })
  }
})

app.post('/cert', (req, res) => {
  var certPem = req.body.pem;
  console.log(certPem);
  var cert = forge.pki.certificateFromPem(certPem);
  var pub = forge.pki.publicKeyToPem(cert.publicKey);

  res.send(
    {
      public_key: pub,
      extensions: cert.extensions,
      issuer: cert.issuer,
      md: cert.md,
      serialNumber: cert.serialNumber,
      siginfo: cert.siginfo,
      signature: cert.signature,
      subject: cert.subject,
      validity: cert.validity,
      version: cert.version
    });
});
