var should = require('should'),
  crypto = require('crypto'),
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  request = require('request'),
  async = require('async'),
  S3 = require('../lib/S3'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire')

var bucket =  process.env.CRATE_BUCKET
var key = process.env.CRATE_KEY
var secret = process.env.CRATE_SECRET
var region = process.env.CRATE_REGION

describe('S3', function() {

  it('should require options', function(done) {
    (function() {
      new S3()
    }).should.throw()

    done()
  })

  it('should require a key', function(done) {
    (function() {
      new S3({})
    }).should.throw()

    done()
  })

  it('should require a secret', function(done) {
    (function() {
      new S3({
        key: 'foo'
      })
    }).should.throw()

    done()
  })

  it('should require a bucket', function(done) {
    (function() {
      new S3({
        key: 'foo',
        secret: 'bar'
      })
    }).should.throw()

    done()
  })

  it('should set a default acl', function(done) {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz'
    })
    s3._options.acl.should.not.be.null

    done()
  })

  it('should accept an acl', function(done) {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz',
      acl: 'qux'
    })
    s3._options.acl.should.equal('qux')

    done()
  })

  it('should set a default region', function(done) {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz'
    })
    s3._options.region.should.not.be.null

    done()
  })

  it('should accept a region', function(done) {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz',
      region: 'qux'
    })
    s3._options.region.should.equal('qux')

    done()
  })

  it.skip('should store and remove a file', function(done) {
    // network operations are slow
    this.timeout(10000)

    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')

    var s3 = new S3({
      key: key,
      secret: secret,
      bucket: bucket,
      region: region
    })

    var s3Url

    async.waterfall([function(callback) {
      // save the file
      s3.save({path: sourceFile}, callback)
    }, function(url, callback) {
      s3Url = url

      // make sure it was uploaded
      request.head(url, callback)
    }, function(response, body, callback) {
      // resource should exist
      response.statusCode.should.equal(200)

      // remove the file
      s3.remove({url: s3Url}, callback)
    }, function(message, callback) {
      // make sure it's not there any more
      request.head(s3Url, callback)
    }, function(response, body, callback) {
      // resource should exist
      response.statusCode.should.not.equal(200)

      // all done
      callback()
    }], function(error) {
      should(error).not.ok

      done()
    })
  })

  it('should allow overriding storage path', function(done) {
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')

    var uploadPath = 'hello'

    var client = {
      putFile: sinon.stub()
    }

    var S3 = proxyquire('../lib/S3', {
      'knox': {
        createClient: function () {
          return client
        }
      }
    })

    var s3 = new S3({
      key: 'PUT_YOUR_KEY_HERE',
      secret: 'PUT_YOUR_BUCKET_HERE',
      bucket: 'PUT_YOUR_BUCKET_HERE',
      region: 'PUT_YOUR_REGION_HERE',
      path: function (attachment) {
        should(attachment).be.ok

        return uploadPath
      }
    })

    var storagePath = 'foo'

    client.putFile.callsArgWith(3, null, {req: {url: storagePath}})

    s3.save({path: sourceFile}, function(error, storedAt) {
      storagePath.should.equal(storedAt)

      client.putFile.getCall(0).args[1].should.equal(uploadPath)

      done()
    })
  })

  it('should support default storage path', function(done) {
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')

    var client = {
      putFile: sinon.stub()
    }

    var S3 = proxyquire('../lib/S3', {
      'knox': {
        createClient: function () {
          return client
        }
      }
    })

    var s3 = new S3({
      key: 'PUT_YOUR_KEY_HERE',
      secret: 'PUT_YOUR_BUCKET_HERE',
      bucket: 'PUT_YOUR_BUCKET_HERE',
      region: 'PUT_YOUR_REGION_HERE'
    })

    var storagePath = 'foo'

    client.putFile.callsArgWith(3, null, {req: {url: storagePath}})

    s3.save({path: sourceFile}, function(error, storedAt) {
      storagePath.should.equal(storedAt)

      client.putFile.getCall(0).args[1].should.equal('/node_js_logo.png')

      done()
    })
  })

  it('should remove a file', function(done) {
    var client = {
      deleteFile: sinon.stub()
    }

    var S3 = proxyquire('../lib/S3', {
      'knox': {
        createClient: function () {
          return client
        }
      }
    })

    var s3 = new S3({
      key: 'PUT_YOUR_KEY_HERE',
      secret: 'PUT_YOUR_BUCKET_HERE',
      bucket: 'PUT_YOUR_BUCKET_HERE',
      region: 'PUT_YOUR_REGION_HERE'
    })

    client.deleteFile.callsArg(1)

    s3.remove({
      url: 'foo'
    }, function() {
      client.deleteFile.getCall(0).args[0].should.equal('foo')

      done()
    })
  })

  it('should not remove a file with no URL', function(done) {
    var client = {
      deleteFile: sinon.stub()
    }

    var S3 = proxyquire('../lib/S3', {
      'knox': {
        createClient: function () {
          return client
        }
      }
    })

    var s3 = new S3({
      key: 'PUT_YOUR_KEY_HERE',
      secret: 'PUT_YOUR_BUCKET_HERE',
      bucket: 'PUT_YOUR_BUCKET_HERE',
      region: 'PUT_YOUR_REGION_HERE'
    })

    client.deleteFile.callsArg(1)

    s3.remove({
      url: null
    }, function() {
      client.deleteFile.callCount.should.equal(0)

      done()
    })
  })
})
