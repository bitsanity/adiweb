var ENCDEC = (function() {

  function encrypt( redjsonobj, aeskeyhex ) {
    let redjsonstring = JSON.stringify( redjsonobj );
    let msgbuff = Buffer.from( redjsonstring, 'UTF-8' );
    let msghex = msgbuff.toString('hex')

    let black = AES256.encrypt( aeskeyhex, msghex )
    return black
  }

  function decrypt( blackmsghex, aeskeyhex ) {
    let red = AES256.decrypt( aeskeyhex, blackmsghex )
    return red
  }

  return {
    encrypt:encrypt,
    decrypt:decrypt
  }

})();

