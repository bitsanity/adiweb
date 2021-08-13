var STRINGS = {};
var LANG = "English";

var LABELS = (function() {
  'use strict';

  function setLabels()
  {
    // Ident Challenge area
    $( "#ADILOSChallengeButton" ).html( STRINGS[LANG].ADILOSChallengeButton );
    $( "#RespondButton").html( STRINGS[LANG].RespondButton );

    // Video/Response area
    $( "#CameraLabel").html( STRINGS[LANG].CameraLabel );
    $( "#CancelResponseButton").html( STRINGS[LANG].CancelResponseButton );

    // Hello
    $( "#PeerPubkeyLabel" ).html( STRINGS[LANG].PeerPubkeyLabel );
    $( "#UserPubkeyLabel" ).html( STRINGS[LANG].UserPubkeyLabel );
    $( "#MOTDLabel" ).html( STRINGS[LANG].MOTDLabel );
    $( "#MOTDButton" ).html( STRINGS[LANG].MOTDButton );
  }

  return {
    setLabels:setLabels
  };

})();
