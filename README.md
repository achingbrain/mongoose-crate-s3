# mongoose-crate-s3

[![Dependency Status](https://david-dm.org/achingbrain/mongoose-crate-s3.svg?theme=shields.io)](https://david-dm.org/achingbrain/mongoose-crate-s3) [![devDependency Status](https://david-dm.org/achingbrain/mongoose-crate-s3/dev-status.svg?theme=shields.io)](https://david-dm.org/achingbrainmongoose-crate-s3#info=devDependencies) [![Build Status](https://img.shields.io/travis/achingbrain/mongoose-crate-s3/master.svg)](https://travis-ci.org/achingbrain/mongoose-crate-s3) [![Coverage Status](http://img.shields.io/coveralls/achingbrain/mongoose-crate-s3/master.svg)](https://coveralls.io/r/achingbrain/mongoose-crate-s3)

A StorageProvider for mongoose-crate that stores files in Amazon S3 buckets

## Usage

```javascript
var mongoose = require('mongoose'),
  crate = require('mongoose-crate'),
  S3 = require('mongoose-crate-s3')

var PostSchema = new mongoose.Schema({
  title: String,
  description: String
})

PostSchema.plugin(crate, {
  storage: new S3({
    key: '<api-key-here>',
    secret: '<secret-here>',
    bucket: '<bucket-here>',
    acl: '<acl-here>', // defaults to public-read
    region: '<region-here>', // defaults to us-standard
    path: function(attachment) { // where the file is stored in the bucket - defaults to this function
      return '/' + path.basename(attachment.path)
    }
  }),
  fields: {
    file: {}
  }
})

var Post = mongoose.model('Post', PostSchema)
```

.. then later:

```javascript
var post = new Post()
post.attach('image', {path: '/path/to/image'}, function(error) {
  // file is now uploaded and post.file is populated e.g.:
  // post.file.url
})
```

## Regions

By default the region is assumed to be `us-standard`.  The region is used to assemble the endpoint so please specify a different one if you are hosting in Europe, for example.

A full list of valid S3 regions is available from the [AWS documentation website](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region).
