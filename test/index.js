'use strict';

const Code = require('code');
const Lab = require('lab');
const CreditCard = require('../');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('CreditCard', () => {
  describe('#validate()', () => {
    it('no invalid responses on valid card', (done) => {
      const card = {
        cardType: 'VISA',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123'
      };
      const validation = CreditCard.validate(card);

      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      done();
    });

    it('no invalid responses on valid card by alias', (done) => {
      const card = {
        cardType: 'VC',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123'
      };
      const validation = CreditCard.validate(card);

      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      done();
    });

    it('invalid responses on invalid card', (done) => {
      const card = {
        cardType: 'VISA',
        number: '4111111111111112',
        expiryMonth: '00',
        expiryYear: '2100',
        cvv: '123'
      };
      const validation = CreditCard.validate(card);

      expect(validation.validCardNumber).to.equal(false);
      expect(validation.validExpiryMonth).to.equal(false);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      done();
    });

    it('defines a new card type', (done) => {
      CreditCard.addType({
        names: [ 'GIFT_CARD' ],
        cardPattern: /^X[0-9]{15}$/,
        partialPattern: /^X/,
        iinLength: 7,
        cvvPattern: /^\d{4}$/,
        checkLuhn: false,
        customValidator: (card) => {
          return card.cvv === '7890';
        }
      });

      const card = {
        number: 'X111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '7890'
      };

      const validation = CreditCard.validate(card);

      // Verify that existing validation still works
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);

      done();
    });
  });

  describe('#getTypeByNumber()', () => {
    it('successfully detects full numbers', (done) => {
      expect(CreditCard.getTypeByNumber('378282246310005').names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('371449635398431').names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('378734493671000').names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('30569309025904').names[0]).to.equal('DINERSCLUB');
      expect(CreditCard.getTypeByNumber('38520000023237').names[0]).to.equal('DINERSCLUB');
      expect(CreditCard.getTypeByNumber('6011111111111117').names[0]).to.equal('DISCOVER');
      expect(CreditCard.getTypeByNumber('6011000990139424').names[0]).to.equal('DISCOVER');
      expect(CreditCard.getTypeByNumber('3530111333300000').names[0]).to.equal('JCB');
      expect(CreditCard.getTypeByNumber('3566002020360505').names[0]).to.equal('JCB');
      expect(CreditCard.getTypeByNumber('5555555555554444').names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('5105105105105100').names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('2221222122212227').names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('2720272027202720').names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('4111111111111111').names[0]).to.equal('VISA');
      expect(CreditCard.getTypeByNumber('4012888888881881').names[0]).to.equal('VISA');
      expect(CreditCard.getTypeByNumber('4222222222222').names[0]).to.equal('VISA');
      expect(CreditCard.getTypeByNumber('0000000000000000')).to.equal(null);
      done();
    });

    it('successfully detects partial numbers if allowPartial is true', (done) => {
      expect(CreditCard.getTypeByNumber('37', { allowPartial: true }).names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('34', { allowPartial: true }).names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('3787344', { allowPartial: true }).names[0]).to.equal('AMERICANEXPRESS');
      expect(CreditCard.getTypeByNumber('305', { allowPartial: true }).names[0]).to.equal('DINERSCLUB');
      expect(CreditCard.getTypeByNumber('38', { allowPartial: true }).names[0]).to.equal('DINERSCLUB');
      expect(CreditCard.getTypeByNumber('6011', { allowPartial: true }).names[0]).to.equal('DISCOVER');
      expect(CreditCard.getTypeByNumber('601100099013', { allowPartial: true }).names[0]).to.equal('DISCOVER');
      expect(CreditCard.getTypeByNumber('35', { allowPartial: true }).names[0]).to.equal('JCB');
      expect(CreditCard.getTypeByNumber('3566002020360505', { allowPartial: true }).names[0]).to.equal('JCB');
      expect(CreditCard.getTypeByNumber('5555555', { allowPartial: true }).names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('51', { allowPartial: true }).names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('2221', { allowPartial: true }).names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('2720', { allowPartial: true }).names[0]).to.equal('MASTERCARD');
      expect(CreditCard.getTypeByNumber('411', { allowPartial: true }).names[0]).to.equal('VISA');
      expect(CreditCard.getTypeByNumber('4', { allowPartial: true }).names[0]).to.equal('VISA');
      expect(CreditCard.getTypeByNumber('42222222222', { allowPartial: true }).names[0]).to.equal('VISA');
      done();
    });

    it('does not allow partial matches if allowPartial is false', (done) => {
      expect(CreditCard.getTypeByNumber('5555555')).to.equal(null);
      expect(CreditCard.getTypeByNumber('4', { allowPartial: false })).to.equal(null);
      done();
    });

    it('successfully detects in filtered types', (done) => {
      expect(CreditCard.getTypeByNumber('378282246310005', { types: [ 'AMERICANEXPRESS' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('371449635398431', { types: [ 'AMERICANEXPRESS' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('378734493671000', { types: [ 'AMERICANEXPRESS' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('30569309025904', { types: [ 'DINERSCLUB' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('38520000023237', { types: [ 'DINERSCLUB' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('6011111111111117', { types: [ 'DISCOVER' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('6011000990139424', { types: [ 'DISCOVER' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('3530111333300000', { types: [ 'JCB' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('3566002020360505', { types: [ 'JCB' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('5555555555554444', { types: [ 'MASTERCARD' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('5105105105105100', { types: [ 'MASTERCARD' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('2221222122212227', { types: [ 'MASTERCARD' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('2720272027202720', { types: [ 'MASTERCARD' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('4111111111111111', { types: [ 'VISA' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('4012888888881881', { types: [ 'VISA' ]})).not.to.equal(null);
      expect(CreditCard.getTypeByNumber('4222222222222', { types: [ 'VISA' ]})).not.to.equal(null);
      done();
    });

    it('returns false for numbers that pass luhn but fail are invalid', (done) => {
      expect(CreditCard.getTypeByNumber('123')).to.equal(null);
      done();
    });

    it('returns null for invalid cards', (done) => {
      expect(CreditCard.getTypeByNumber('4111111111111111', { types: [ 'AMERICANEXPRESS' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('5555555555554444', { types: [ 'DINERSCLUB' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('3530111333300000', { types: [ 'DISCOVER' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('6011111111111117', { types: [ 'JCB' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('30569309025904', { types: [ 'MASTERCARD' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('2220222022202220', { types: [ 'MASTERCARD' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('378282246310005', { types: [ 'VISA' ]})).to.equal(null);
      done();
    });

    it('returns null for unknown card types', (done) => {
      expect(CreditCard.getTypeByNumber('4111111111111111', { types: [ '' ]})).to.equal(null);
      expect(CreditCard.getTypeByNumber('5555555555554444', { types: [ 'foo' ]})).to.equal(null);
      done();
    });
  });

  describe('#getTypeByName()', () => {
    it('returns true for valid cvv matches', (done) => {
      expect(CreditCard.getTypeByName('AMERICANEXPRESS').checkCvv('1234')).to.equal(true);
      expect(CreditCard.getTypeByName('DINERSCLUB').checkCvv('123')).to.equal(true);
      expect(CreditCard.getTypeByName('DISCOVER').checkCvv('456')).to.equal(true);
      expect(CreditCard.getTypeByName('JCB').checkCvv('789')).to.equal(true);
      expect(CreditCard.getTypeByName('MASTERCARD').checkCvv('012')).to.equal(true);
      expect(CreditCard.getTypeByName('VISA').checkCvv('333')).to.equal(true);
      done();
    });

    it('returns false for invalid cvvs', (done) => {
      expect(CreditCard.getTypeByName('AMERICANEXPRESS').checkCvv('123')).to.equal(false);
      expect(CreditCard.getTypeByName('DINERSCLUB').checkCvv('1234')).to.equal(false);
      expect(CreditCard.getTypeByName('DISCOVER').checkCvv('1')).to.equal(false);
      expect(CreditCard.getTypeByName('JCB').checkCvv('')).to.equal(false);
      expect(CreditCard.getTypeByName('MASTERCARD').checkCvv(null)).to.equal(false);
      expect(CreditCard.getTypeByName('VISA').checkCvv({})).to.equal(false);
      done();
    });

    it('returns false for unknown card types', (done) => {
      expect(CreditCard.getTypeByName('')).to.equal(null);
      expect(CreditCard.getTypeByName('foo')).to.equal(null);
      done();
    });
  });
});
