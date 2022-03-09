# adiweb

UPDATE: [Video Chat and Demo](https://youtu.be/88haZoa9v48)

PLEASE READ DISCLAIMERS/NOTES AT BOTTOM


This repo illustrates use of the [ADILOS](https://github.com/bitsanity/ADILOS)
protocol to exchange public keys and then communicate securely with elliptic-curve
encryption.

**adiweb** includes two programs: **gkeeper** and **agentui**



### gkeeper

This is an ADILOS gatekeeper listening for HTTP POST messages in which the
body is a [JSON-RPC 2.0](https://www.jsonrpc.org/specification) *Request*
object containing one of three recognized commands:

* `getChallenge` : sent by **agentui** and/or compatible clients to request the
gatekeeper generate and return an ADILOS identity challenge
* `setResponse` : enables clients to return an ADILOS identity response and
thereby complete the public-key exchange. Returns the session public key in
hex format - the client must include this in future requests
* `do` : enables clients to provide an encrypted and signed request and receive
an encrypted response.

To run:

```
install node.js and npm modules
then:
$ cd gkeeper
$ node jsonrpcintf.js
```

### agentui

This is an ADILOS keymaster-gatekeeper agent ("KGAgent") that bridges a user
holding her private key(s) in her keymaster app on her smartphone to a
gatekeeper existing somewhere on the web.

**agentui** is intended to run on a desktop/laptop/RaspberryPi or kiosk. It
requires an HD camera in order to perform the optical key exchange with the
user. It also requires internet access to communicate with our **gkeeper** RPC
service.

**agentui** is a webapp intended to run on [NW.js](https://nwjs.io). This is
a basic chrome web browser with a node.js javascript engine, that makes it nice
for including npm modules in a project.

To run:

```
install nw.js
decompress an adiweb release, or install the node_modules manually
then:
$ cd agentui
$ nw .
```


# DISCLAIMERS/NOTES

* This code is intended for illustration and education. The **gkeeper** program
depends on node.js's "http" module, which may now or someday be vulnerable to
some kind(s) of web attack.
* **simpleth** is one implementation of a ADILOS/keymaster.

