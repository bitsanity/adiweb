const aesjs = require( 'aes-js' );

function remove0x( hex ) {
  if (hex.startsWith("0x") || hex.startsWith("0X")) return hex.slice(2)
  return hex
}

exports.encrypt = function( sharedKeyHex, messageHex ) {
  let key = aesjs.utils.hex.toBytes( remove0x(sharedKeyHex) )
  let msg = aesjs.utils.hex.toBytes( remove0x(messageHex) )

  let aesCtr = new aesjs.ModeOfOperation.ctr( key )
  let black = aesCtr.encrypt( msg )
  return aesjs.utils.hex.fromBytes( black )
}

exports.decrypt = function( sharedKeyHex, messageHex ) {
  let key = aesjs.utils.hex.toBytes( remove0x(sharedKeyHex) )
  let msg = aesjs.utils.hex.toBytes( remove0x(messageHex) )

  let aesCtr = new aesjs.ModeOfOperation.ctr( key )
  let red = aesCtr.decrypt( msg )
  return aesjs.utils.hex.fromBytes( red )
}

exports.selfTest = function() {
  let key =
    [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31 ]

  let keyHex = aesjs.utils.hex.fromBytes( key )

  let secretMessageHex =
    aesjs.utils.hex.fromBytes( Buffer.from("SUCCESS", "UTF-8") )

  let blackHex = exports.encrypt( keyHex, secretMessageHex )
  let redHex = exports.decrypt( keyHex, blackHex )
  let red = Buffer.from( redHex, 'hex' )
  console.log( Buffer.from(red, "UTF-8").toString() )
}
