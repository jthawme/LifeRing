const expect = require('chai').expect;

const cli = require('../lib/src/cli');

describe('CLI', function() {
  describe('commands', function() {
    it('should return falsey for non commands', function() {
      expect(cli.getCommand('nothing')).to.be.undefined;
    });
    it('should return the command for valid commands', function() {
      expect(cli.getCommand('help')).to.be.an('object');
    });
  });

  describe('validation', function() {
    it('should throw error for wrong arguments', function(done) {
      cli.validateArguments(cli.getCommand('backup'), [5])
        .catch(() => {
          done();
        })
    });

    it('should return true for valid commands', function(done) {
      cli.validateArguments(cli.getCommand('setup'), ['test'])
        .then(() => done());
    });
  });
});
