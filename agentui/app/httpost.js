var HTTPOST = (function() {

  const RPCSRVR = "localhost"
  const RPCPORT = 8080

  function postRPCMessage( msgobj, errcb, rescb ) {
    let options = {
      url: 'http://' + RPCSRVR + ':' + RPCPORT,
      json: true,
      body: msgobj
    }

    HTTPREQ.post( options, (err,res,body) => {
      if (err) { return errcb(console.log(err)) }

      if (res.statusCode == 200 || res.statusCode == 201) {
        if (body) {
          rescb( body.result );
        }
      }
      else {
        return errcb( 'unrecognized status: ' + res.statusCode );
      }
    } )
  }

  return {
    postRPCMessage:postRPCMessage
  }

})();

