'use strict';

var expect = require('chai').expect;
var flow = require('../lib/flow');
var sinon = require('sinon');

describe('flow.serial', () => {
    it('should return null with empty array', () => {
        flow.serial([], (err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.null;
        });
    });

    it('should call callback with error', () => {
        flow.serial([
            (cb) => {
                cb(null, null);
            },
            (data, cb) => {
                cb('err');
            }
        ],
        (err, res) => {
            expect(err).to.equal('err');
        });
    });

    it('should transmit data to the next function', () => {
        flow.serial([
            (cb) => {
                cb(null, 0);
            },
            (n, cb) => {
                cb(null, ++n);
            },
            (n, cb) => {
                cb(null, ++n);
            }
        ],
        (err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.equal(2);
        });
    });

    it('should call callback with error only once', () => {
        var spy = sinon.spy((err, data) => {
            expect(spy.calledOnce).to.be.true;
        });

        flow.serial([
            (cb) => {
                cb('err');
            },
            (data, cb) => {
                cb('err');
            }
        ], spy);
    });
});

describe('flow.parallel', () => {
    it('should return null with empty array', () => {
        flow.parallel([], (err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.null;
        });
    });

    it('should call callback with error', () => {
        flow.parallel([
                (cb) => {
                    cb(null, null);
                },
                (cb) => {
                    cb('err');
                }
            ],
            (err) => {
                expect(err).to.equal('err');
            });
    });

    it('should return array with results of functions', (done) => {
        var spy = sinon.spy((err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.instanceof(Array);
            expect(res).to.have.lengthOf(3);
            expect(res).to.include(0);
            expect(res).to.include(1);
            expect(res).to.include(2);
            done();
        });

        flow.parallel([
                (cb) => {
                    cb(null, 0);
                },
                (cb) => {
                    setTimeout(() => {
                        cb(null, 1);
                    }, 250);
                },
                (cb) => {
                    cb(null, 2);
                }
            ], spy);
    });

    it('should call callback with error only once', () => {
        var spy = sinon.spy();

        flow.parallel([
            (cb) => {
                cb('err');
            },
            (cb) => {
                cb('err');
            }
        ], spy);

        expect(spy.calledOnce).to.be.true;
    });
});

describe('flow.map', () => {
    it('should return null with empty array', () => {
        flow.map([], () => {}, (err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.null;
        });
    });

    it('should call callback with error only once', () => {
        var spy = sinon.spy((err, data) => {
            expect(err).to.exist;
            expect(data).to.not.exist;
            expect(spy.calledOnce).to.be.true;
        });

        flow.map([0,1],
            (data, cb) => {
                cb('err');
            }, spy);
    });

    it('should return changed array', (done) => {
        var spy = sinon.spy((err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.instanceof(Array);
            expect(res).to.have.lengthOf(3);
            expect(res).to.include(1);
            expect(res).to.include(2);
            expect(res).to.include(3);
            done();
        });

        flow.map([0,1,2],
            (data, cb) => {
                setTimeout(() => {
                    cb(null, ++data);
                }, 250);
            }, spy);
    });
});
