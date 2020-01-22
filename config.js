require('dotenv/config');
const path = require('path');

const env = process.env;

const statusField = 'appStatus';
const statusesToPublish = [ 'Publish' ];
const keyField = 'key';
const valField = 'theCopy';

const outputPath = path.join(process.cwd(), 'l10n', 'en-us.json')

module.exports.config = {
    apiKey: env.AIRTABLE_API_KEY
  , baseId: env.AIRTABLE_BASE_ID
  , tableName: env.AIRTABLE_TABLE_NAME
  , primaryKeyField: keyField
  , theCopyField: valField
  , filter: generateStatusFilter(statusField, statusesToPublish)
  , output: outputPath
};

function generateStatusFilter(field, values) {
  let filterArr = [];

  values.forEach(val => {
    filterArr.push(`${field}='${val}'`);
  })

  return `OR(${filterArr.join(',')})`;
}