const path = require('path');
const fs = require('fs')
const fsPromises = fs.promises;
const { promisify } = require('util')
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)

const axios = require('axios')
const HOST = "https://www.fundslibrary.co.uk"
const PATH = "FundsLibrary.BrandedTools/AvivaConsumer/FundCentral/Funds"
const PAGE_SIZE = 200

function toCSV(arr,delim) {
    const array = [Object.keys(arr[0])].concat(arr)
    
    return array.map(it => {
      return Object.values(it).join(delim);
    }).join('\n')
  }

/*
{
  pageNumber: 1,
  totalPages: 8,
  hasNextPage: true,
  pageSize: 200,
  totalItems: 1519,
  results: [
    {
      id: '144cf863-dce7-425c-b970-333de69c837a',
      fundNameNoGroup: '7IM AAP Adventurous S6',
      performanceQuarterEndDate: '2024-09-30T00:00:00',
      performanceDate: '2024-10-04T00:00:00',
      name: 'Aviva Pension 7IM AAP Adventurous S6',
*/
// ?page=1&pageSize=200&masterlist=Pension.AvivaConsumer&fundType=Pension"

const getFunds = async () => {
    let page = 1
    let totalPages = 0
    let Query = `page=${page}&pageSize=${PAGE_SIZE}&masterlist=Pension.AvivaConsumer&fundType=Pension`
    let nextResource = `${HOST}/${PATH}/?${Query}`
    let FUNDS = []

    do {
        console.log(nextResource)
        const { data } = await axios.get(nextResource)
        if(totalPages == 0) { totalPages = data.totalPages}
        if(page <= totalPages ) page++

        Query = `page=${page}&pageSize=${PAGE_SIZE}&masterlist=Pension.AvivaConsumer&fundType=Pension`
        nextResource = `${HOST}/${PATH}/?${Query}`

        console.log("Results:",data.results.length)
        console.log("pageNumber:",data.pageNumber)
        FUNDS = [...FUNDS,...data.results]
    } while (page <= totalPages)

    console.log("FUNDS.length:",FUNDS.length)
    return FUNDS;
} 

const formatFunds = async () => {
    // Load Funds

    const funds = JSON.parse(await readFileAsync("./aviva-finds.json"));

    let rFunds = funds.map((e) => {
        return {            
            name: e.name,
            investmentFundType: e.investmentFundType.replaceAll(","," "),
            riskRating: e.riskRating,
            ocfTer: e.ocfTer,
            fmec: e.fmec,
            additionalCharge: e.additionalCharge
        }
    })
    await writeFileAsync("./aviva-finds.csv",toCSV(rFunds));
}
//  pageSize: 200,
// totalItems: 1519,
// const { data } = await axios.get(
// "https://www.fundslibrary.co.uk/FundsLibrary.BrandedTools/AvivaConsumer/FundCentral/Funds/
//?page=&pageSize=200&masterlist=Pension.AvivaConsumer&fundType=Pension"
//)
//pageNumber: 1,
// totalPages: 8,
// hasNextPage: true,
(async () => {
    // await writeFileAsync("./aviva-finds.json",JSON.stringify(await getFunds()));
    await formatFunds()
    console.log('================================')
})()

