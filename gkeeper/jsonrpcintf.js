const fs = require( 'fs' );
const http = require( 'http' );
const crypto = require( 'crypto' );
const secp256k1 = require( 'secp256k1' );
const hasher = require( 'hash.js' );
const adilos = require( 'adilosjs' );
const ecies = require( 'ecies-parity' );

const respHeader = { 'Content-Type' : 'application/json; charset=utf-8' };
const rpcTemplate = { jsonrpc:"2.0", id:null };
const errObjTempl = { code:0, message:"errormsg", data:null };
const myPort = 8080;

var sessionsdb = {};

http.createServer( function(req, resp) {
  resp.on( 'error', (err) => { console.log( 'resp error: ' + err ); } );

  try {
    if ( req.method != 'POST' ) throw 'POST only';

    let body = [];

    req.on( 'error', (err) => {

      resp.writeHead( 400, respHeader );
      resp.end( '{"error" : "' + err + '"}' );

    } ).on( 'data', (data) => {

      body.push( data );

    } ).on( 'end', async function() {

      body = Buffer.concat( body ).toString();

      try {
        let answer = await handleMessage( JSON.parse(body) );
        resp.writeHead( 200, { respHeader } );
        resp.end( JSON.stringify(answer) );
      }
      catch( ex ) {
        let errrsp = JSON.parse( JSON.stringify(rpcTemplate) ); // deep copy
        errrsp.error = JSON.parse( JSON.stringify(errObjTempl) );
        errrsp.error.message = "invalid request";
        errrsp.error.data = ex.toString();
        console.log( 'request: ' + body + "\nresp: " + JSON.stringify(errrsp) );
        resp.writeHead( 400, { respHeader } );
        resp.end( JSON.stringify(errrsp) );
      }
    } );
  }
  catch( ex )
  {
    resp.writeHead( 400, { respHeader } );

    let errrsp = JSON.parse( JSON.stringify(rpcTemplate) ); // deep copy
    errrsp.error = JSON.parse( JSON.stringify(errObjTempl) );
    errrsp.error.message = ex.toString();

    console.log( JSON.stringify(errrsp) );

    resp.end( JSON.stringify( errrsp ) );
  }
} ).listen( myPort );

function handleLogin() {
  let rpcrsp = JSON.parse( JSON.stringify(rpcTemplate) ); // deep copy

  let sesskey = crypto.randomBytes( 32 );
  let pubkey = secp256k1.publicKeyCreate( sesskey, true );
  let sesskeyhex = adilos.toHexString( sesskey );
  let pubkeyhex = adilos.toHexString( pubkey );
  console.log( 'new session pubkey: ' + pubkeyhex );

  sessionsdb[pubkeyhex] = {
    privkeyhex: sesskeyhex,
    challenged: Date.now(),
  }

  rpcrsp.result = adilos.makeChallenge( sesskey );

  return rpcrsp;
}

function handleLoginResponse( rspB64 ) {
  let parts = adilos.parse( rspB64 )

  let mypubkey = adilos.toHexString( parts[0].pubkey );
  let peerpubkey = adilos.toHexString( parts[1].pubkey );
  console.log( 'agent is: ' + peerpubkey )

  if (    !sessionsdb[mypubkey]
       || !sessionsdb[mypubkey].challenged
       || sessionsdb[mypubkey].challenged == 0) {
    throw 'no session';
  }

  let peerpubkey65 = parts[1].pubkey;

  if (parts[1].pubkey.length == 33) {
    peerpubkey65 = new Uint8Array( 65 )

    secp256k1.publicKeyConvert(
      new Uint8Array(parts[1].pubkey),
      /* compressed = */ false,
      peerpubkey65 )
  }

  sessionsdb[mypubkey].agentpubkey = peerpubkey;
  sessionsdb[mypubkey].agentpubkey65 = peerpubkey65;
  sessionsdb[mypubkey].authenticated = Date.now()

  let rpcrsp = JSON.parse( JSON.stringify(rpcTemplate) ); // deep copy
  rpcrsp.result = mypubkey;

  return rpcrsp
}

async function handleDo( redobj, sessionpubkey ) {

  if (redobj == null) throw 'nothing to do'
  if (redobj.req == null) throw 'missing request'

  if ('motd' == redobj.req) {
    return {rsp:'Chancellor on brink of second bailout for banks'}
  }

  throw 'unrecognized reqest: ' + redobj.req
}

async function handleMessage( msg )
{
  var mth = msg['method'];
  var prm = msg['params'];
  var pbk = msg['id'];

  if ('getChallenge' === mth) {
    return handleLogin();
  }

  if ('setResponse' === mth) {
    let rspB64 = prm[0];
    return handleLoginResponse( rspB64 );
  }

  // 'id' field is session pubkey
  if (!sessionsdb[pbk]) {
    throw 'no session for pbk'
  }

  // confirm agent signed the message correctly
  let msgbytes = Buffer.from( prm[0], 'hex' );
  let msgHash =
    new Uint8Array( hasher.sha256().update( msgbytes.buffer ).digest() );

  let ellsig = new Uint8Array(64);
  secp256k1.signatureImport(
    new Uint8Array( adilos.fromHexString(prm[1])), ellsig );

  if (!secp256k1.ecdsaVerify(
    ellsig,
    msgHash,
    new Uint8Array(sessionsdb[pbk].agentpubkey65))) {
    throw "bad sig";
  }

  if ('do' === mth) {
    let redjsonstr = await ecies.decrypt(
      Buffer.from(sessionsdb[pbk].privkeyhex,'hex'), Buffer.from(prm[0],'hex'))

    console.log( 'do: ' + redjsonstr );
    let redresultobj = await handleDo( JSON.parse(redjsonstr), pbk )

    let blackresult =
      await ecies.encrypt(Buffer.from(sessionsdb[pbk].agentpubkey65),
	                  Buffer.from(JSON.stringify(redresultobj),'UTF-8'))

    let blackresulthex = blackresult.toString('hex')

    let hash = Uint8Array.from(
      hasher.sha256().update(blackresult.buffer).digest() );

    let privui8a =
      new Uint8Array( Buffer.from(sessionsdb[pbk].privkeyhex, 'hex') )

    let sig = Uint8Array.from(
      secp256k1.ecdsaSign( hash, privui8a ).signature
    )

    let dersig = new Uint8Array(72)
    let sigout = secp256k1.signatureExport( sig, dersig )
    let sighex = adilos.toHexString( sigout )

    let rpcRsp = JSON.parse( JSON.stringify(rpcTemplate) ) // deep copy
    rpcRsp.result = { msg:blackresulthex, sig:sighex }
    rpcRsp.id = pbk

    console.log( 'result: ' + JSON.stringify(rpcRsp) );
    return rpcRsp
  }
  else { throw "invalid command" }
}
