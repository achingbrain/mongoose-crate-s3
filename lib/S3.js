var util = require("util"),
	fs = require("fs"),
	path = require("path"),
	async = require("async"),
	knox = require("knox"),
	StorageProvider = require("mongoose-crate").StorageProvider;

var S3StorageProvider = function(options) {
	StorageProvider.call(this);

	this._options = options;

	if(!this._options) {
		throw new Error("Please specify options");
	}

	if(!this._options.key) {
		throw new Error("Please specify a key");
	}

	if(!this._options.secret) {
		throw new Error("Please specify a secret");
	}

	if(!this._options.bucket) {
		throw new Error("Please specify a bucket");
	}

	if(!this._options.acl) {
		this._options.acl = "public-read";
	}

	if(!this._options.region) {
		this._options.region = "us-standard";
	}

	this._client = knox.createClient({
		key: this._options.key,
		secret: this._options.secret,
		bucket: this._options.bucket,
		region: this._options.region
	});
}
util.inherits(S3StorageProvider, StorageProvider);

S3StorageProvider.prototype.save = function(file, callback) {
	var request = this._client.putFile(path.basename(file), file, {
		"x-amz-acl": this._options.acl
	}, function(error) {
		callback(error, request.url);
	});
};

S3StorageProvider.prototype.remove = function(url, callback) {
	this._client.deleteFile(path.basename(attachment.path)).on("response", callback).end();
};

module.exports = S3StorageProvider;
