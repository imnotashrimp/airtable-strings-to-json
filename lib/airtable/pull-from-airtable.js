const airtableConfig = require('./airtable-config').config;
const request = require('request-promise');

console.clear();

getStringsFromAirtable(airtableConfig);

async function getStringsFromAirtable (airtableConfig) {
  let allStringsArr = [];
  const apiKey = airtableConfig.apiKey;
  const baseId = airtableConfig.baseId;
  const tableName = airtableConfig.tableName;
  const primaryKeyField = airtableConfig.primaryKeyField;
  const theCopyField = airtableConfig.theCopyField;
  const filter = airtableConfig.filter;

  console.log(`Filtering records: ${filter}`);

  const apiBaseUrl =
    `https://api.airtable.com/v0/${baseId}/${tableName}?api_key=${apiKey}`;

  const addStrings = (records) => {
    // Parses Airtable response fields, generates new object, and appends to
    // allStrings array
    records.forEach((record) => {

      // TODO catch empty strings
      // TODO catch nonexistant keys

      // Update allStrings object, to be sent to the plugin
      allStringsArr.push(record);
    })
  }

  const pageToFetch = (page, offset) => {
    let url = ''

    switch(page) {
      case 'first':
        url =
          `${apiBaseUrl}&fields=${primaryKeyField}&fields=${theCopyField}&filterByFormula=${filter}`
        break

      case 'next':
        url = `${apiBaseUrl}&offset=${offset}`
        break
    }

    return url
  }

  const getResults = async (page, nextOffset) => {
    console.log(`Fetching ${page} page from Airtable...`)
    try {
      let url = pageToFetch(page, nextOffset);
      let response = JSON.parse(await request(url));
      let { records, offset } = response;
      let finalObject = records.map(
        ({fields: { key, theCopy }}) =>
          ({ [key]: theCopy})
      );

      // Amend the allStrings object, to be passed back to the plugin
      addStrings(finalObject);

      // Get next page if it's there
      if (offset) await getResults('next', offset)
    } catch(err) {
      console.log(err)
    }

  }

  await getResults('first')
  console.log('Done.')
  console.log(allStringsArr.length, 'records returned.')
  return allStringsArr
}
