var KGAgent = (function() {

  const motdRequest = {req: "motd"}

  var serverPubkey;
  var agentkey = CRYPTO.randomBytes( 32 );

  var Agent = {
    privkey: agentkey,
    pubkey: SECP256K1.publicKeyCreate( agentkey, true )
  }

  function addAgentToChallenge( gkChallB64 ) {
    return ADILOS.makeResponse( gkChallB64, Agent.privkey )
  }

  function onLogin( obj ) {
    serverPubkey = ADILOS.fromHexString( obj.svr );
  }

  function makeMsgSigParams( blacktexthex ) {
    let result = [ blacktexthex ]
    let blackbytes = Buffer.from( blacktexthex, 'hex' )

    let dig32 =
      Uint8Array.from( HASHLIB.sha256().update(blackbytes.buffer).digest() );
    let sig = SECP256K1.ecdsaSign(dig32, Agent.privkey).signature;
    let dersig = new Uint8Array(72);
    let outobj = SECP256K1.signatureExport( sig, dersig );

    result.push( ADILOS.toHexString(outobj) )
    return result;
  }

  function parseRpcResponse( rsp ) {
    if (!rsp || !rsp.msg || !rsp.sig) {
      alert( 'invalid response' )
      return
    }

    // confirm server's key signed the response
    let msg = Buffer.from( rsp.msg, 'hex' ); // => UTF-8 bytes
    let hash = new Uint8Array(HASHLIB.sha256().update( msg.buffer ).digest());
    let ellsig = new Uint8Array(64);
    SECP256K1.signatureImport(
      new Uint8Array(ADILOS.fromHexString(rsp.sig)), ellsig );
    let pubkeybytes = new Uint8Array( serverPubkey )
    if ( !SECP256K1.ecdsaVerify(ellsig, hash, pubkeybytes) ) {
      throw "bad sig";
    }

    return rsp.msg;
  }

  function getMOTD() {

    let rpcmsg = {
      method:"do",
      params: [],
      id: ADILOS.toHexString(serverPubkey)
    }

    ENCDEC.encrypt(
      motdRequest,
      Buffer.from(serverPubkey),
      err => {
        alert( err )
        return
      },
      res => {
        rpcmsg.params = makeMsgSigParams( res )

        HTTPOST.postRPCMessage( rpcmsg, errmsg => {
          alert( errmsg );
        }, resp => {

          try {
            ENCDEC.decrypt( Agent.privkey, parseRpcResponse(resp), err2 => {
              alert( err )
              return
            },
            redobj => {
              PubSub.publish( 'MOTD', redobj.rsp );
            } );
          }
          catch (ex) {
            console.log( ex )
            alert( ex.toString() )
          }
        } );
    } )
  }

  PubSub.subscribe( 'LoggedIn', onLogin );
  PubSub.subscribe( 'GetMOTD', getMOTD );

  return {
    addAgentToChallenge:addAgentToChallenge
  }

})();

