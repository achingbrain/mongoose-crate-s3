var should = require("should"),
	crypto = require("crypto"),
	os = require("os"),
	fs = require("fs"),
	path = require("path"),
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

	it("should store a file", function(done) {
		done();
	})
})
