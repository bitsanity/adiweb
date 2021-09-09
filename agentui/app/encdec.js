//
// NOTE: ecies-parity library requires public keys be uncompressed (65 bytes)
//
var ENCDEC = (function() {

  // returns a black hex string
  function encrypt( redjsonobj, pubkeybuff, errcb, rescb ) {

    let pubkeybuff65 = pubkeybuff

    if (pubkeybuff.length == 33) {
      let uipk = new Uint8Array( pubkeybuff )
      pubkeybuff65 = new Uint8Array( 65 )

      SECP256K1.publicKeyConvert( uipk, /* compressed= */ false, pubkeybuff65 )
    }

    try {
      let redjsonstring = JSON.stringify( redjsonobj );
      let msgbuff = Buffer.from( redjsonstring, 'UTF-8' );

      ECIES.encrypt( Buffer.from(pubkeybuff65), msgbuff )
      .then( (encryptedbuff) => {
        rescb( encryptedbuff.toString('hex') );
      } )
    } catch(ex) { errcb( ex.toString() ) }
  }

  // returns redobj
  function decrypt( privkeybytes, blackmsghex, errcb, rescb ) {

    try {
      let blackmsgbuff = Buffer.from( blackmsghex, 'hex' );
      let privkeybuff = Buffer.from( privkeybytes );

      ECIES.decrypt( privkeybuff, blackmsgbuff )
      .then( redjsonbuff => {
        rescb( JSON.parse(redjsonbuff.toString()) );
      } )
    }
    catch (ex) { errcb( ex.toString() ) }
  }

  return {
    encrypt:encrypt,
    decrypt:decrypt
  }
})();

