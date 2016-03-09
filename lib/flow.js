'use strict';

module.exports.serial = function (funcArray, callback) {
    var next = function (error, data) {
        if (error) {
            callback(error);
            return;
        }
        if (nextFunctions.length == 0) {
            callback(null, data);
            return;
        }
        if (typeof data != 'undefined') {
            nextFunctions.shift()(data, next);
            return;
        }
        nextFunctions.shift()(next);
    };
    if (funcArray.length == 0) {
        callback(null, null);
        return;
    }
    var nextFunctions = funcArray.slice();
    next();
};

module.exports.parallel = function (funcArray, callback) {
    var resArray = [];
    var hasError = false;
    var next = function (error, data) {
        if (hasError) {
            return;
        }
        if (error) {
            callback(error);
            hasError = true;
            return;
        }
        resArray.push(data);
        if (resArray.length == funcArray.length) {
            callback(null, resArray);
        }
    };
    if (funcArray.length == 0) {
        callback(null, null);
        return;
    }
    funcArray.forEach(function (func) {
        func(next);
    });
};

module.exports.map = function (valueArray, func, callback) {
    var resArray = [];
    var hasError = false;
    var next = function (error, data) {
        if (hasError) {
            return;
        }
        if (error) {
            callback(error);
            hasError = true;
            return;
        }
        resArray.push(data);
        if (resArray.length == valueArray.length) {
            callback(null, resArray);
        }
    };
    if (valueArray.length == 0) {
        callback(null, null);
        return;
    }
    valueArray.forEach(function (value) {
        func(value, next);
    });
};
