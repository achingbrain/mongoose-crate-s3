var expect = require('chai').expect
var path = require('path')
var request = require('request')
var async = require('async')
var S3 = require('../lib/S3')
var sinon = require('sinon')
var proxyquire = require('proxyquire')

var bucket = process.env.CRATE_BUCKET
var key = process.env.CRATE_KEY
var secret = process.env.CRATE_SECRET
var region = process.env.CRATE_REGION

describe('S3', function () {

  it('should require options', function () {
    expect(function () {
      return new S3()
    }).to.throw
  })

  it('should require a key', function () {
    expect(function () {
      return new S3({})
    }).to.throw
  })

  it('should require a secret', function () {
    expect(function () {
      return new S3({
        key: 'foo'
      })
    }).to.throw
  })

  it('should require a bucket', function () {
    expect(function () {
      return new S3({
        key: 'foo',
        secret: 'bar'
      })
    }).to.throw
  })

  it('should set a default acl', function () {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz'
    })
    expect(s3._options.acl).to.be.ok
  })

  it('should accept an acl', function () {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz',
      acl: 'qux'
    })
    expect(s3._options.acl).to.equal('qux')
  })

  it('should set a default region', function () {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz'
    })
    expect(s3._options.region).to.be.ok
  })

  it('should accept a region', function () {
    var s3 = new S3({
      key: 'foo',
      secret: 'bar',
      bucket: 'baz',
      region: 'qux'
    })
    expect(s3._options.region).to.equal('qux')
  })

  it.skip('should store and remove a file', function (done) {
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

    async.waterfall([function (callback) {
      // save the file
      s3.save({path: sourceFile}, callback)
    }, function (url, callback) {
      s3Url = url

      // make sure it was uploaded
      request.head(url, callback)
    }, function (response, body, callback) {
      // resource should exist
      expect(response.statusCode).to.equal(200)

      // remove the file
      s3.remove({url: s3Url}, callback)
    }, function (message, callback) {
      // make sure it's not there any more
      request.head(s3Url, callback)
    }, function (response, body, callback) {
      // resource should exist
      response.statusCode.should.not.equal(200)

      // all done
      callback()
    }], function (error) {
      expect(error).to.not.exist

      done()
    })
  })

  it('should allow overriding storage path', function (done) {
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
        expect(attachment).to.be.ok

        return uploadPath
      }
    })

    var storagePath = 'foo'

    client.putFile.callsArgWith(3, null, {req: {url: storagePath}})

    s3.save({path: sourceFile}, function (error, storedAt) {
      expect(error).to.not.exist
      expect(storagePath).to.equal(storedAt)
      expect(client.putFile.getCall(0).args[1]).to.equal(uploadPath)

      done()
    })
  })

  it('should support default storage path', function (done) {
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

    s3.save({path: sourceFile}, function (error, storedAt) {
      expect(error).to.not.exist
      expect(storagePath).to.equal(storedAt)
      expect(client.putFile.getCall(0).args[1]).to.equal('/node_js_logo.png')

      done()
    })
  })

  it('should remove a file', function (done) {
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
    }, function () {
      expect(client.deleteFile.getCall(0).args[0]).to.equal('foo')

      done()
    })
  })

  it('should remove a file with a long path', function (done) {
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
      url: 'http://example.com/foo/bar/baz.zip'
    }, function () {
      expect(client.deleteFile.getCall(0).args[0]).to.equal('/foo/bar/baz.zip')

      done()
    })
  })

  it('should not remove a file with no URL', function (done) {
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
    }, function () {
      expect(client.deleteFile.callCount).to.equal(0)

      done()
    })
  })

  it('should check the statusCode of the response', function (done) {
    var S3 = proxyquire('../lib/S3', {
      'knox': {
        createClient: function () {
          return {}
        }
      }
    })

    var s3 = new S3({
      key: 'PUT_YOUR_KEY_HERE',
      secret: 'PUT_YOUR_BUCKET_HERE',
      bucket: 'PUT_YOUR_BUCKET_HERE',
      region: 'PUT_YOUR_REGION_HERE',
      path: function (attachment) {
        expect(attachment).to.be.ok

        return attachment
      }
    })

    var ret
    ret = s3._queryResult(true, null, sinon.stub().returnsArg(0))
    expect(ret).to.be.true

    var res = {
      on: sinon.stub(),
      statusCode: 200,
      req: {
        url: 'fakeurl'
      }
    }
    ret = s3._queryResult(false, res, sinon.stub().returnsArg(1))
    expect(ret).to.equal('fakeurl')

    var err = new Error()
    err.statusCode = 300
    err.body = 'mouse'

    res = {
      on: function (type, chunkfunc) {
        if (type === 'data') {
          chunkfunc('mouse')
        } else {
          ret = chunkfunc()
        }
      },
      statusCode: 300
    }
    s3._queryResult(false, res, sinon.stub().returnsArg(0))

    expect(ret.statusCode).to.equal(err.statusCode)
    expect(ret.body).to.equal(err.body)

    done()
  })
})
