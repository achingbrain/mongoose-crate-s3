var should = require("should"),
	crypto = require("crypto"),
	os = require("os"),
	fs = require("fs"),
	path = require("path"),
	S3 = require("../lib/S3");

function randomString(length) {
	return crypto.randomBytes(Math.ceil(length/2))
		.toString("hex")
		.slice(0, length);
}

describe("S3", function() {

	it("should store a file", function(done) {
		done();
	})
})
