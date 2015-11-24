/**
 * Created by flogvit on 2015-06-29.
 *
 * @copyright Cellar Labs AS, 2015, www.cellarlabs.com, all rights reserved
 * @file
 * @license MIT
 * @author Vegard Hanssen <Vegard.Hanssen@cellarlabs.com>
 *
 */

var Request = require('../request.js');
var should = require('should');
require('assert');
var _ = require('underscore');

describe('Check request', function () {
    it('should understand basic request', function (done) {
        var req = new Request({
            command: 'test'
        })
        req.dataCore().should.eql({command: 'test', now: req.dataCore().now});
        done();
    })
    it('should understand param request', function (done) {
        var req = new Request({
            command: 'test',
            params: {
                test: 'test'
            }
        })
        req.dataCore().should.eql({command: 'test', now: req.dataCore().now, params: {test: 'test'}});
        done();
    })
    it('should be able to build request', function (done) {
        var req = new Request().withCommand('test').withParam('test', 'test2');
        req.dataCore().should.eql({command: 'test', now: req.dataCore().now, params: {test: 'test2'}});
        done();
    })

    it('should be able to clone itself', function(done) {
        var req = new Request().withCommand('test').withParam('test', 'test2');
        var req2 = req.clone();
        req.withParam('test', 'test3');
        req2.dataCore().should.eql({command: 'test', now: req.dataCore().now, params: {test: 'test2'}});
        done();
    })
})
