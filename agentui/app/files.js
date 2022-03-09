var FileList = (function() {

  function getFileList() {
  }

  PubSub.subscribe( 'GetFileList', getFileList );

  return {
    getFileList: getFileList
  }

})();

