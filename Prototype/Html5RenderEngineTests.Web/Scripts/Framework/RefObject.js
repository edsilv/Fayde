﻿//#region RefObject

RefObject.prototype = new Object;
RefObject.prototype.constructor = RefObject;
function RefObject() {
    Object.call(this);
    var id;
    do {
        id = new Date().getTime();
    } while (id === RefObject._LastID);
    RefObject._LastID = this._ID = id;
}
RefObject.prototype.RefEquals = function (robj) {
    if (!(robj instanceof RefObject))
        return false;
    return this._ID === robj._ID;
};
RefObject.GetBaseClass = function () { return Object; };

///#endregion