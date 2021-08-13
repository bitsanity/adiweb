var LoginCtrl = (function() {

  var wrappedChallenge;

  function doGetChallenge( data ) {
    let rpcmsg = { method:"getChallenge", params: [], id: null }

    HTTPOST.postRPCMessage( rpcmsg, errmsg => {
      alert( errmsg );
    }, chall => {
      wrappedChallenge = KGAgent.addAgentToChallenge( chall );
      PubSub.publish( 'Challenge', wrappedChallenge ); // to show to keymaster
    } );
  }

  function doChallengeResponse( qr ) {
    let rpcmsg = { method:'setResponse', params: [ '' + qr ], id: null }

    HTTPOST.postRPCMessage( rpcmsg, errmsg => {
      alert(errmsg);
    }, res => {
      let km = ADILOS.toHexString( ADILOS.parse(qr)[2].pubkey );
      PubSub.publish( 'LoggedIn', {user:km, svr:res} );
    } );
  }

  PubSub.subscribe( 'GetChallenge', doGetChallenge );

  PubSub.subscribe( 'QRScanned', qr => { doChallengeResponse(qr) } );

  return {
    doGetChallenge:doGetChallenge,
    doChallengeResponse:doChallengeResponse
  }

})();

