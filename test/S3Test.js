var should = require("should"),
	crypto = require("crypto"),
	os = require("os"),
	fs = require("fs"),
	path = require("path"),
	request = require("request"),
	async = require("async"),
	S3 = require("../lib/S3");

describe("S3", function() {

	it("should require options", function(done) {
		(function() {
			new S3();
		}).should.throw();

		done();
	})

	it("should require a key", function(done) {
		(function() {
			new S3({});
		}).should.throw();

		done();
	})

	it("should require a secret", function(done) {
		(function() {
			new S3({
				key: "foo"
			});
		}).should.throw();

		done();
	})

	it("should require a bucket", function(done) {
		(function() {
			new S3({
				key: "foo",
				secret: "bar"
			});
		}).should.throw();

		done();
	})

	it("should set a default acl", function(done) {
		var s3 = new S3({
			key: "foo",
			secret: "bar",
			bucket: "baz"
		});
		s3._options.acl.should.not.be.null;

		done();
	})

	it("should accept an acl", function(done) {
		var s3 = new S3({
			key: "foo",
			secret: "bar",
			bucket: "baz",
			acl: "qux"
		});
		s3._options.acl.should.equal("qux");

		done();
	})

	it("should set a default region", function(done) {
		var s3 = new S3({
			key: "foo",
			secret: "bar",
			bucket: "baz"
		});
		s3._options.region.should.not.be.null;

		done();
	})

	it("should accept a region", function(done) {
		var s3 = new S3({
			key: "foo",
			secret: "bar",
			bucket: "baz",
			region: "qux"
		});
		s3._options.region.should.equal("qux");

		done();
	})

	it("should store and remove a file", function(done) {

		// if you want to run this test, remove the next line and add your S3 details below
		return done();

		var bucket =  "PUT_YOUR_BUCKET_HERE";
		var key = "PUT_YOUR_KEY_HERE";
		var secret = "PUT_YOUR_BUCKET_HERE";
		var region = "PUT_YOUR_REGION_HERE";
		var sourceFile = path.resolve(__dirname + "/./fixtures/node_js_logo.png");

		var s3 = new S3({
			key: key,
			secret: secret,
			bucket: bucket,
			region: region
		});

		var s3Url;

		async.waterfall([function(callback) {
			// save the file
			s3.save({path: sourceFile}, callback);
		}, function(url, callback) {
			s3Url = url;

			// make sure it was uploaded
			request.head(url, callback);
		}, function(response, body, callback) {
			// resource should exist
			response.statusCode.should.equal(200);

			// remove the file
			s3.remove({url: s3Url}, callback);
		}, function(message, callback) {
			// make sure it's not there any more
			request.head(s3Url, callback);
		}, function(response, body, callback) {
			// resource should exist
			response.statusCode.should.not.equal(200);

			// all done
			callback();
		}], function(error) {
			should(error).not.ok;

			done();
		});
	})
})
