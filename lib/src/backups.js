const path = require('path');
const fs = require('fs');

const { format } = require('date-fns');

const { getSetting } = require('./defaults');

function getBackupName(database) {
  return `${ format(new Date(), "yyyy-MM-dd-t")}-${ database }.tar`;
}

function getBackupFilePath(name) {
  const backupDir = getSetting('backup_dir');

  if (!backupDir) {
    throw "No backup directory set";
  }

  return path.join(backupDir, name);
}

function getBackupFiles(name) {
  const backupDir = getSetting('backup_dir');

  return fs.readdirSync(backupDir)
    .sort((a, b) => {
        return fs.statSync(path.join(backupDir, b)).mtime.getTime() -
            fs.statSync(path.join(backupDir, a)).mtime.getTime();
    })
    .filter(f => f.includes(`-${ name }.tar`))
}

function trimBackupFiles(name, limit) {
  const backupDir = getSetting('backup_dir');
  const files = getBackupFiles(name);

  const dels = files.slice(limit);

  dels.forEach(item => fs.unlinkSync(path.join(backupDir, item)));

  return dels.length;
}

module.exports = { getBackupName, getBackupFilePath, getBackupFiles, trimBackupFiles };
