# adiweb


PLEASE READ DISCLAIMERS/NOTES AT BOTTOM


This repo illustrates use of the [ADILOS](https://github.com/bitsanity/ADILOS)
protocol and the [simpleth ](https://github.com/bitsanity/simpleth) app to
perform a secure exchange of public keys and thereafter use elliptic-curve
encryption to exchange messages.

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
an encrypted response. The thing the client wants the service to do is included
within the encrypted message for privacy.



### agentui

This is an ADILOS keymaster-gatekeeper agent ("KGAgent") that bridges a user
holding her private key(s) in her keymaster app on her smartphone to a
gatekeeper existing somewhere on the web.

**agentui** is intended to run on a desktop/laptop/RaspberryPi or kiosk. It
requires an HD camera in order to perform the optical key exchange with the
user. It also requires internet access to communicate with our **gkeeper** RPC
service.



# DISCLAIMERS/NOTES

* **adiweb** uses a 128-bit implemention of [Elliptic Curve Integrated Encryption Standard](https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption). This is good but probably not safe enough for super-top-secret.
* See [sigp/ecies-parity](https://github.com/sigp/ecies-parity) "Cryptography
Warning"
* This code is intended for illustration and education. The **gkeeper** program
depends on node.js's "http" module, which may now or someday be vulnerable to
some kind(s) of web attack.
* **simpleth** is one implementation of a ADILOS/keymaster. It is a free app
already available on [Google Play](https://play.google.com/store/apps/details?id=com.simpleth&hl=en)

