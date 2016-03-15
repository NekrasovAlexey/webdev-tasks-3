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
        (err) => {
            expect(err).to.equal('err');
        });
    });

    it('should transmit data to the next function', () => {
        let spy1 = sinon.spy((n, cb) => {
            cb(null, ++n);
        });
        let spy2 = sinon.spy((n, cb) => {
            cb(null, ++n);
        });
        let spyCb = sinon.spy((err, res) => {});
        flow.serial([
            (cb) => {
                cb(null, 0);
            },
            spy1,
            spy2
        ],
        spyCb);

        expect(spyCb.calledWith(null, 2)).to.be.true;
        expect(spy1.calledWith(0)).to.be.true;
        expect(spy2.calledWith(1)).to.be.true;
    });

    it('should call callback with error only once', () => {
        let spyCb = sinon.spy((err, data) => {
            expect(spyCb.calledOnce).to.be.true;
            expect(spy1.calledOnce).to.be.true;
            expect(spy2.called).to.be.false;

        });
        let spy1 = sinon.spy((cb) => {
            cb('err');
        });
        let spy2 = sinon.spy((cb) => {
            cb('err');
        });

        flow.serial([
            spy1,
            spy2
        ], spyCb);
    });
});

describe('flow.parallel', () => {
    it('should return null with empty array', () => {
        flow.parallel([], (err, res) => {
            expect(err).to.be.null;
            expect(res).to.be.null;
        });
    });

    it('should call first function', () => {
        let spy = sinon.spy((cb) => {
            cb(null, null);
        });
        flow.parallel([
                spy,
                (cb) => {
                    cb('err');
                }
            ],
            () => {
                expect(spy.calledOnce).to.be.true;
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
        let spy = sinon.spy((err, res) => {
            expect(err).to.be.null;
            expect(res).eql([0, 1, 2]);
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
        let spy = sinon.spy();

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
        let spy = sinon.spy((err, data) => {
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
        let spy = sinon.spy((err, res) => {
            expect(err).to.be.null;
            expect(res).eql([1,2,3]);
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
