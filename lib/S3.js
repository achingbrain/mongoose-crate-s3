var path = require("path"),
	knox = require("knox"),
	check = require("check-types");

var S3StorageProvider = function(options) {
	this._options = options;

	check.verify.object(this._options, "Please specify S3 options");
	check.verify.string(this._options.key, "Please specify a S3 key");
	check.verify.string(this._options.secret, "Please specify a S3 secret");
	check.verify.string(this._options.bucket, "Please specify a S3 bucket");

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
};

S3StorageProvider.prototype.save = function(attachment, callback) {
	this._client.putFile(file, path.basename(attachment.path), {
		"x-amz-acl": this._options.acl
	}, function(error, message) {
		callback(error, message.req.url);
	});
};

S3StorageProvider.prototype.remove = function(attachment, callback) {
	this._client.deleteFile(path.basename(attachment.url), callback);
};

module.exports = S3StorageProvider;
