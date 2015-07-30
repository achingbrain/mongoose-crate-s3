var path = require('path')
var url = require('url')
var knox = require('knox')
var check = require('check-types')

var S3StorageProvider = function (options) {
  this._options = options

  check.assert.object(this._options, 'Please specify S3 options')
  check.assert.string(this._options.key, 'Please specify a S3 key')
  check.assert.string(this._options.secret, 'Please specify a S3 secret')
  check.assert.string(this._options.bucket, 'Please specify a S3 bucket')

  if (!this._options.acl) {
    this._options.acl = 'public-read'
  }

  if (!this._options.region) {
    this._options.region = 'us-standard'
  }

  if (typeof this._options.path !== 'function') {
    this._options.path = function (attachment) {
      return '/' + path.basename(attachment.path)
    }
  }

  this._client = knox.createClient({
    key: this._options.key,
    secret: this._options.secret,
    bucket: this._options.bucket,
    region: this._options.region
  })
}

S3StorageProvider.prototype.save = function (attachment, callback) {
  var self = this

  this._client.putFile(attachment.path, this._options.path(attachment),
    {'x-amz-acl': this._options.acl }, function (error, res) {
    self._queryResult(error, res, callback)
  })
}

S3StorageProvider.prototype.remove = function (attachment, callback) {
  var self = this

  if (!attachment.url) {
    return callback()
  }
    this._client.deleteFile(url.parse(attachment.url)['path'], function (error, res) {
    self._queryResult(error, res, callback)
  })
}

S3StorageProvider.prototype._queryResult = function (error, res, callback) {
  if (error) {
    return callback(error)
  }

  if (res && 'on' in res) {
    if (res.statusCode >= 200 && res.statusCode <= 209) {
      return callback(null, res.req.url)
    }

    var body = ''

    res.on('data', function (chunk) {
      body += chunk
    })

    res.on('end', function () {
      var err = new Error()
      err.statusCode = res.statusCode
      err.body = body

      return callback(err)
    })
  } else {
    if (res && 'req' in res) {
      callback(null, res.req.url)
    } else {
      callback()
    }
  }
}

module.exports = S3StorageProvider
