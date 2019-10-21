const engine = require('../../lib/engine');
const mock = require('mock-fs');

const backupDir = engine.getDefaultBackupDirectory();

const MOCKS = {
  NAME: 'testdb',
  USER: 'testuser',
  HOURS: 12,
  BACKUP_LIMIT: 10,
  CRON: '* 12 * * * *'
};

const BACKUP_FILES = {
  [backupDir]: {
    [`23-01-1992-OTHER.tar`]: mock.file({
      content: '',
      mtime: new Date('1992-01-23')
    }),
    [`23-02-1992-${MOCKS.NAME}.tar`]: mock.file({
      content: '',
      mtime: new Date('1992-02-23')
    }),
    [`23-02-1992-OTHER.tar`]: mock.file({
      content: '',
      mtime: new Date('1992-02-23')
    }),
    [`01-01-1992-${MOCKS.NAME}.tar`]: mock.file({
      content: '',
      mtime: new Date('1992-01-01')
    }),
    [`23-01-1992-${MOCKS.NAME}.tar`]: mock.file({
      content: '',
      mtime: new Date('1992-01-23')
    }),
  }
};

module.exports = { BACKUP_FILES, MOCKS };
