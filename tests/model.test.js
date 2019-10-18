const fs = require('fs');
const path = require('path');

const { expect } = require('chai');

const Database = require('../lib/model/Database');
const engine = require('../lib/engine');

const MOCKS = {
  NAME: 'testdb',
  USER: 'testuser',
  HOURS: 12,
  BACKUP_LIMIT: 10,
  CRON: '* 12 * * * *'
};

describe('Model', function() {
  describe('Instantiate', function() {
    it('should throw error without name', function() {
      expect(() => new Database()).to.throw()
    });

    it('should be instance of Database', function() {
      expect(new Database(MOCKS.NAME)).to.be.an.instanceOf(Database);
    });

    it('should register name', function() {
      const model = new Database(MOCKS.NAME);
      expect(model.name).to.equal(MOCKS.NAME);
    });

    it('should include intent for all keys', function() {
      const model = new Database(MOCKS.NAME);
      expect(model.keys).to.have.members(['name', 'user', 'hours', 'backup_limit', 'cron']);
    });

    it('should not include and actual properties', function() {
      const model = new Database(MOCKS.NAME);
      expect(model.properties).to.not.include.any.keys('user', 'hours', 'backup_limit', 'cron');
    });
  });

  describe('Fill', function() {
    it('can fill all properties', function() {
      const model = new Database(MOCKS.NAME);
      model.fill({
        user: MOCKS.USER,
        hours: MOCKS.HOURS,
        backup_limit: MOCKS.BACKUP_LIMIT
      });

      expect(model.user).to.equal(MOCKS.USER);
      expect(model.hours).to.equal(MOCKS.HOURS);
      expect(model.backup_limit).to.equal(MOCKS.BACKUP_LIMIT);
    });

    it('should cut any unneeded keys', function() {
      const model = new Database(MOCKS.NAME);
      model.fill({
        user: MOCKS.USER,
        hours: MOCKS.HOURS,
        backup_limit: MOCKS.BACKUP_LIMIT,
        other: 'test'
      });

      expect(model.other).to.be.undefined;
    });

    it('should return all relevant details', function() {
      const mockKeys = Object.keys(MOCKS).map(k => k.toLowerCase());

      const model = new Database(MOCKS.NAME);
      model.fill({
        user: MOCKS.USER,
        hours: MOCKS.HOURS,
        backup_limit: MOCKS.BACKUP_LIMIT
      });

      expect(model.return()).to.include.all.keys(...mockKeys);
    });
  });

  describe('Load', function() {
    before(function(done) {
      engine.runInitialise()
        .then(() => done());
    });

    it('should error if file doesn\'t exist', function(done) {
      const model = new Database(MOCKS.NAME);

      model.load()
        .catch(() => {
          done();
        });
    });
  });

  describe('Save', function() {
    before(function(done) {
      engine.runInitialise()
        .then(() => done());
    });

    it('should return a promise', function(done) {
      const model = new Database(MOCKS.NAME);
      model.save()
        .then(() => {
          done();
        })
    });

    it('should create a saved file', function(done) {
      const model = new Database(MOCKS.NAME);
      model.save()
        .then(() => engine.getDatabaseFile(MOCKS.NAME))
        .then(settingsFile => {
          expect(fs.existsSync(settingsFile)).to.equal(true);
          done();
        })
    });
  });
});
