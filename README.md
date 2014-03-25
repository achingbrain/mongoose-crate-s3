# mongoose-crate-s3

[![Dependency Status](https://david-dm.org/achingbrain/mongoose-crate-s3.svg?theme=shields.io)](https://david-dm.org/achingbrain/mongoose-crate-s3) [![devDependency Status](https://david-dm.org/achingbrain/mongoose-crate-s3/dev-status.svg?theme=shields.io)](https://david-dm.org/achingbrainmongoose-crate-s3#info=devDependencies) [![Build Status](https://img.shields.io/travis/achingbrain/mongoose-crate-s3/master.svg)](https://travis-ci.org/achingbrain/mongoose-crate-s3) [![Coverage Status](http://img.shields.io/coveralls/achingbrain/mongoose-crate-s3/master.svg)](https://coveralls.io/r/achingbrain/mongoose-crate-s3)

A StorageProvider for mongoose-crate that stores files in Amazon S3 buckets

## Usage

```javascript
var mongoose = require('mongoose'),
  crate = require("mongoose-crate"),
  S3 = require("mongoose-crate-s3");

var PostSchema = new mongoose.Schema({
  title: String,
  description: String
});

PostSchema.plugin(crate, {
  storage: new S3({
    key: "<api-key-here>",
    secret: "<secret-here>",
    bucket: "<bucket-here>",
    acl: "<acl-here>" // defaults to public-read
  }),
  fields: {
    file: {}
  }
});

var Post = mongoose.model('Post', PostSchema);
```

.. then later:

```javascript
var post = new Post();
post.attach("image", {path: "/path/to/image"}, function(error) {
	// file is now uploaded and post.file is populated e.g.:
	// post.file.url
});
```
