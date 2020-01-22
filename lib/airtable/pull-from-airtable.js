const airtableConfig = require('./airtable-config').config;
const request = require('request-promise');

console.clear();

let strings = getStringsFromAirtable(airtableConfig);
// console.log({strings});

async function getStringsFromAirtable (airtableConfig) {
  let allStringsArr = [];
  const apiKey = airtableConfig.apiKey;
  const baseId = airtableConfig.baseId;
  const tableName = airtableConfig.tableName;
  const primaryKeyField = airtableConfig.primaryKeyField;
  const theCopyField = airtableConfig.theCopyField;
  const filter = airtableConfig.filter;

  const apiBaseUrl =
    `https://api.airtable.com/v0/${baseId}/${tableName}?api_key=${apiKey}`

  const addStrings = (records) => {
    // Parses Airtable response fields, generates new object, and appends to
    // allStrings array
    records.forEach((record) => {

      // var key = record.fields[primaryKeyField]
      // var value = record.fields[theCopyField]

      // TODO catch empty strings
      // TODO catch nonexistant keys

      // if (!key) return

      // Update allStrings object, to be sent to the plugin
      allStringsArr.push(record)
      // console.log(allStrings[key]); // debug
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
    try {
      let url = pageToFetch(page, nextOffset)
      let response = JSON.parse(await request(url));
      let { records, offset } = response;
      let finalObject = records.map(({fields: { key, theCopy }}) => ({ [key]: theCopy} ))

      // Amend the allStrings object, to be passed back to the plugin
      addStrings(finalObject)

      // Get next page if it's there
      if (offset) await getResults('next', offset)
    } catch(err) {
      console.log(err)
    }


  }

  await getResults('first')
  return allStringsArr
}

const filterForKeys = (varNames, primaryKeyField) => {
  let filterArr = []

  varNames.forEach(element => {
    filterArr.push(`${primaryKeyField}='${element}'`)
  })

  let filterStr = filterArr.join(',')

  return `OR(${filterStr})`
}


// function makeAirtableCall (url) {
//   return new Promise( (resolve, reject) => {

//     request.open('GET', url)
//     setTimeout(() => {
//       console.log('timed out')
//       const timedOutMsg = {
//         error: {
//           type: 'REQUEST_TIMED_OUT'
//         }
//       }
//       handleBadResponse(timedOutMsg)
//    }, 10000)

//     request.responseType = 'text'
//     try {
//       console.log('sending request: ', request)
//       request.send()
//     } catch (error) {
//       console.log('caught error: ', error)
//       return reject(error)
//     }
//     request.onload = () => {
//       return resolve (request.response)
//     }
//   })
// }
