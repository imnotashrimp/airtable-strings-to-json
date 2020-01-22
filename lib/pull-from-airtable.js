const airtableConfig = require('../config').config;
const request = require('request-promise');

console.clear();

let exportedJson = {};

getStringsFromAirtable(airtableConfig);

async function getStringsFromAirtable (airtableConfig) {
  const apiKey = airtableConfig.apiKey;
  const baseId = airtableConfig.baseId;
  const tableName = airtableConfig.tableName;
  const primaryKeyField = airtableConfig.primaryKeyField;
  const theCopyField = airtableConfig.theCopyField;
  const filter = airtableConfig.filter;

  console.log(`Filtering records: ${filter}`);

  const apiBaseUrl =
    `https://api.airtable.com/v0/${baseId}/${tableName}?api_key=${apiKey}`;

  const pageToFetch = (page, offset) => {
    let url = ''

    switch(page) {
      case 'first':
        url =
          `${apiBaseUrl}&fields=${primaryKeyField}&fields=${theCopyField}&filterByFormula=${filter}`;
        break;

      case 'next':
        url = `${apiBaseUrl}&offset=${offset}`;
        break;
    }

    return url;
  }

  const getResults = async (page, nextOffset) => {
    console.log(`Fetching ${page} page from Airtable...`)
    try {
      let url = pageToFetch(page, nextOffset);
      let response = JSON.parse(await request(url));
      let { records, offset } = response;
      records.forEach(({fields: { key, theCopy }}) => {
        if (exportedJson[key]) throw new Error('duplicated key:', key);
        exportedJson[key] = theCopy
      });

      // Get next page if it's there
      if (offset) await getResults('next', offset);
    } catch(err) {
      console.log(err);
    }

  }

  await getResults('first');
  console.log('Done.');
  console.log(Object.keys(exportedJson).length, 'records.');
  return exportedJson;
}
