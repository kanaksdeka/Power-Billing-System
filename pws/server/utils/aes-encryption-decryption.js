var CryptoJS = require("crypto-js");
/**
 * [AESEncryptDecryption description]
 */
var AESEncryptDecryption = function() {
    this.base64Key = "VGhlQmVzdFNlY3JldEtleQ==";
    this.key = CryptoJS.enc.Base64.parse(this.base64Key);    
}

/**
 * [encrypt description]
 * @param  {[type]} password [description]
 * @return {[type]}          [description]
 */
AESEncryptDecryption.prototype.encrypt = function(password) {
    var self = this;
    // this is Base64-encoded encrypted data
    var encryptedData = CryptoJS.AES.encrypt(password, self.key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encryptedData;
}

/**
 * [decrypt description]
 * @param  {[type]} encryptedData [description]
 * @return {[type]}               [description]
 */
AESEncryptDecryption.prototype.decrypt = function(encryptedData) {
    var self = this;
    // this is the decrypted data as a sequence of bytes
    var decryptedData = CryptoJS.AES.decrypt(encryptedData, self.key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    // this is the decrypted data as a string
    var decryptedText = decryptedData.toString(CryptoJS.enc.Utf8);
    return decryptedText;
}

module.exports = AESEncryptDecryption;