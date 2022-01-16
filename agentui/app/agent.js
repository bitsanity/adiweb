var KGAgent = (function() {

  var userPubkey;
  var serverPubkey;
  var agentkey = CRYPTO.randomBytes( 32 );

  var Agent = {
    privkey: agentkey,
    pubkey: SECP256K1.publicKeyCreate( agentkey, true )
  }

  function addAgentToChallenge( gkChallB64 ) {
    PubSub.publish( 'AgentIs' , ADILOS.toHexString(Agent.pubkey) )
    return ADILOS.makeResponse( gkChallB64, Agent.privkey )
  }

  function onLogin( obj ) {
    userPubkey = obj.user;
    serverPubkey = ADILOS.fromHexString( obj.svr );

    setTimeout( isMember, 250 )
    setTimeout( isAdmin, 500 )
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

  function doRpcExchange( reqobj, rescb ) {

    let rpcmsg = {
      method:"do",
      params: [],
      id: ADILOS.toHexString(serverPubkey)
    }

    let aeskeyarr = new Uint8Array( 32 )
    SECP256K1.ecdh(
      /* pubkey */ serverPubkey,
      /* seckey */ Agent.privkey,
      /* option */ {},
      /* output */ aeskeyarr )

    let aeskeyhex = ADILOS.toHexString( aeskeyarr )

    let black = ENCDEC.encrypt( reqobj, aeskeyhex )
    rpcmsg.params = makeMsgSigParams( black )

    HTTPOST.postRPCMessage(
      rpcmsg,
      errmsg => {
        alert( errmsg );
      },
      resp => {
        console.log( 'resp: ' + JSON.stringify(resp) )
        let redmsg = parseRpcResponse( resp )
        let redhex = ENCDEC.decrypt( redmsg, aeskeyhex )
        let redstr = Buffer.from( redhex, 'hex' ).toString('UTF-8')
        let redobj = JSON.parse( redstr )
        console.log( 'redobj: ' + JSON.stringify(redobj) )
        rescb( redobj )
      }
    );
  }

  const motdRequest = {req:"motd"}

  function getMOTD() {
    doRpcExchange( motdRequest, redobj => {
      PubSub.publish( 'MOTD', redobj.rsp );
    } )
  }

  function setMOTD( msg ) {
    let setMOTDRequest = {req:"setMOTD", motd:msg}
    doRpcExchange( setMOTDRequest, redobj => {
      if (!redobj.rsp)
        alert( 'failed to set MOTD' )
    } )
  }

  function isMember() {
    let isMemberRequest = {req:"isMember"}
    doRpcExchange( isMemberRequest, redobj => {
      PubSub.publish( 'IsMemberResult', redobj.rsp );
    } )
  }

  function isAdmin() {
    let isAdminRequest = {req:"isAdmin"}
    doRpcExchange( isAdminRequest, redobj => {
      PubSub.publish( 'IsAdminResult', redobj.rsp );
    } )
  }

  PubSub.subscribe( 'LoggedIn', onLogin );
  PubSub.subscribe( 'GetMOTD', getMOTD );
  PubSub.subscribe( 'SetMOTD', setMOTD );

  return {
    addAgentToChallenge:addAgentToChallenge
  }

})();

