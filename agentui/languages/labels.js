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
    $( "#ResetButton" ).html( STRINGS[LANG].ResetButton );
    $( "#PeerPubkeyLabel" ).html( STRINGS[LANG].PeerPubkeyLabel );
    $( "#UserPubkeyLabel" ).html( STRINGS[LANG].UserPubkeyLabel );
    $( "#IsMemberLabel" ).html( STRINGS[LANG].IsMemberLabel );
    $( "#IsAdminLabel" ).html( STRINGS[LANG].IsAdminLabel );
    $( "#AgentPubkeyLabel" ).html( STRINGS[LANG].AgentPubkeyLabel );
    $( "#MOTDLabel" ).html( STRINGS[LANG].MOTDLabel );
    $( "#MOTDButton" ).html( STRINGS[LANG].MOTDButton );
    $( "#SetMOTDButton" ).html( STRINGS[LANG].SetMOTDButton );

    $( "#SelectedFileLabel" ).html( STRINGS[LANG].SelectedFileLabel );
    $( "#DownloadButton" ).html( STRINGS[LANG].DownloadButton );
    $( "#UploadFileLabel" ).html( STRINGS[LANG].UploadFileLabel );
    $( "#UploadButton" ).html( STRINGS[LANG].UploadButton );
  }

  return {
    setLabels:setLabels
  };

})();
