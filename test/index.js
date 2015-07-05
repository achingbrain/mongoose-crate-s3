var expect = require('chai').expect
var index = require('../')

describe('index', function () {

  it('should export something', function () {
    expect(index).to.be.a('function')
  })
})
