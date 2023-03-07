var json_keys = function(){
    this.getKeys = function(obj, val){
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] === 'object') {
            objects = objects.concat(this.getKeys(obj[i], val));
        } else if (obj[i] === val) {
            objects.push(obj);
        }
    }
    return objects;

}
}
module.exports = new json_keys();