var util = require("util"),
	fs = require("fs"),
	path = require("path"),
	async = require("async"),
	StorageProvider = require("mongoose-crate").StorageProvider;

var S3StorageProvider = function(options) {
	StorageProvider.call(this);

	this._options = options;
}
util.inherits(S3StorageProvider, StorageProvider);

S3StorageProvider.prototype.save = function(file, callback) {
	console.warn("S3StorageProvider#save not implemented yet..");
};

S3StorageProvider.prototype.remove = function(attachment, callback) {
	console.warn("S3StorageProvider#remove not implemented yet..");
};

module.exports = S3StorageProvider;
