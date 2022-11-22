/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE album 
  ADD cover TEXT NULL`);
};
