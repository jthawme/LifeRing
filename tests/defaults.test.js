const fs = require('fs');
const os = require('os');
const path = require('path');

const mock = require('mock-fs');
const { expect } = require('chai');

const engine = require('../lib/engine');
const constants = require('../lib/constants');

describe('Intialise', function() {
  before(function() {
    mock();
  });

  describe('Default settings', function() {
    it('should include all default keys', function() {
      expect(engine.getDefaultSettings()).to.have.all.keys('backup_dir', 'settings_dir');
    });
  });

  describe('Settings Directory', function() {
    it('should default to in project directory', function() {
      expect(engine.getSettingsDirectory()).to.equal(
        path.join(constants.ROOT, constants.DEFAULTS.SETTINGS_DIR)
      );
    });
  });

  describe('Settings Directory FS', function() {
    before(function(done) {
      fs.mkdir(engine.getSettingsDirectory(), err => {
        if (!err) {
          done();
        } else {
          throw err;
        }
      });
    });

    it('should return a promise', function() {
      return expect(engine.ensureDirectory(engine.getSettingsDirectory())).to.be.a('promise');
    });

    it('should create a directory', function() {
      return expect(fs.existsSync(engine.getSettingsDirectory())).to.equals(true);
    });

    it('should save settings file', function(done) {
      engine.saveSettings(engine.getDefaultSettings())
        .then(settings => {
          fs.exists(engine.getSettingsFile(), (exists) => {
            expect(exists).to.equal(true);
            done();
          });
        })
    });
  });

  describe('Backup Directory', function() {
    it('should default to in user\'s home directory', function() {
      expect(engine.getDefaultBackupDirectory()).to.equal(
        path.join(os.homedir(), constants.DEFAULTS.BACKUP_DIR)
      );
    });
  });

  describe('Backup Directory FS', function() {
    before(function(done) {
      fs.mkdir(engine.getDefaultBackupDirectory(), err => {
        if (!err) {
          done();
        } else {
          throw err;
        }
      });
    });

    it('should return a promise', function() {
      return expect(engine.ensureDirectory(engine.getDefaultBackupDirectory())).to.be.a('promise');
    });

    it('should create a directory', function() {
      return expect(fs.existsSync(engine.getDefaultBackupDirectory())).to.equals(true);
    });
  });

  describe('Initialise', function() {
    it('should return a promise', function() {
      return expect(engine.runInitialise()).to.be.a('promise');
    });
  });

  describe('Get values', function() {
    before(function(done) {
      engine.runInitialise()
        .then(() => done());
    });

    it('should return settings', function() {
      const settings = engine.getSettings()
      expect(settings).to.be.an('object');
    });
  });

  describe('Destroy', function() {
    before(function(done) {
      engine.runInitialise()
        .then(() => done());
    });

    it('should delete folders', async () => {
      const exists = await engine.destroy()
        .then(() => fs.existsSync(engine.getDefaultBackupDirectory()));

      expect(exists).to.equal(false);
    });
  });

  after(function() {
    mock.restore();
  })
});

