const fs = require('fs');

const mock = require('mock-fs');
const { expect } = require('chai');

const Database = require('../lib/model/Database');
const engine = require('../lib/engine');

const { MOCKS, BACKUP_FILES } = require('./data/data');

const getTestingModel = () => {
  const model = new Database(MOCKS.NAME);
  model.fill({
    user: MOCKS.USER,
    hours: MOCKS.HOURS,
    backup_limit: MOCKS.BACKUP_LIMIT
  });
  model._setTesting();

  return model;
}

describe('Model', function() {
  before(function(done) {
    mock(BACKUP_FILES);

    engine.runInitialise()
      .then(() => done());
  });

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

    it('should error if file doesn\'t exist', function(done) {
      const model = new Database(MOCKS.NAME);

      model.load()
        .catch(() => {
          done();
        });
    });
  });

  describe('Save', function() {
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

  describe('Backup', function() {

    it('should return a file reference', function(done) {
      const model = new Database(MOCKS.NAME);
      model.fill({
        user: MOCKS.USER,
        hours: MOCKS.HOURS,
        backup_limit: MOCKS.BACKUP_LIMIT
      });
      model._setTesting();

      model.backup()
        .then(({ absolute }) => {
          try {
            expect(absolute).to.be.a('string');
            done();
          } catch (e) {
            done(e);
          }
        })
    });

    it('should contain reference to database in name', function(done) {
      const model = getTestingModel();

      model.backup()
        .then(({ absolute }) => {
          try {
            expect(absolute).to.contain(`-${MOCKS.NAME}.tar`)
            done();
          } catch (e) {
            done(e);
          }
        })
    });
  });

  describe('Restore', function() {
    it('should get backup files related to itself', function() {
      const files = engine.getBackupFiles(MOCKS.NAME);
      expect(files.length).to.equal(3);
    });

    it('should error when asking for an unknown restore index', function(done) {
      const model = getTestingModel();

      model.restore(5)
        .catch(() => done());
    });

    it('should resolve when index in range', function(done) {
      const model = getTestingModel();

      model.restore(1)
        .then(() => done());
    });
  });

  describe('Trim', function() {
    it('should reduce backups to limit', function() {
      const model = getTestingModel();

      const deleted = model.limit(1);
      expect(deleted).to.equal(2);
    });
  });

  after(function() {
    mock.restore();
  })
});
