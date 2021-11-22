const { Connection, PublicKey } = require('@solana/web3.js');
const { Market } =require('@project-serum/serum');
const Response = require("../modules/response.class");
const moment = require("moment");

const serumProgramId = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
let lastPrices = {};
const methods = {
    connection: async function(){
        //const url = "https://api.mainnet-beta.solana.com";
        const url = "https://solana-api.tt-prod.net";
        const connection = new Connection(url, 'recent')
        const version = await connection.getVersion()
        return connection
    },
    getCoinInfo: function(name){
        const coins = {
            QUEST:{
                marketAddress: "7QwEMFeKS8mPACndc9EzpgoqKbQhpBm1N4JCtzjGEyR7"
            }
        }
        return coins[name];
    },
    getMarketInfo: function(marketAddress=null, bonfidapair=null){
        const marketInfos = [
            {address: "7QwEMFeKS8mPACndc9EzpgoqKbQhpBm1N4JCtzjGEyR7", pair:"QUEST/USDT", bonfidapair:"QUESTUSDT"},
            {address: "HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1", pair:"SOL/USDT", bonfidapair:"SOLUSDT"}
        ];
        let marketInfo;
        if(marketAddress){
            marketInfo = marketInfos.find(srch=>srch.address == marketAddress);
        }
        if (bonfidapair){
            marketInfo = marketInfos.find(srch=>srch.bonfidapair == bonfidapair);
        }
        return marketInfo;
    },
    getTrade:async function(req, res){
        let response = new Response();
        const marketInfo = module.exports.getMarketInfo(req.params.marketAddress);
        let trades = [];
        if(marketInfo){
            const connection = await module.exports.connection();
            let marketAddress = new PublicKey(marketInfo.address);
            let marketProgramId = new PublicKey(serumProgramId);
            let market = await Market.load(connection, marketAddress, {}, marketProgramId);
            let fills = await market.loadFills(connection, 10000);
            const construct = fills.filter(fill=>fill.eventFlags.fill && !fill.eventFlags.maker);
            trades = construct.map(fill=>({
                feeCost:fill.feeCost,
                market: marketInfo.pair,
                marketAddress: req.params.marketAddress,
                orderId: "",
                price: fill.price,
                side: fill.side,
                size: fill.size,
                time: 0
            }));
        }
        response.success = true;
        response.data = trades;
        return response;
    },
    getPrice:async function(req, res){
        let response = new Response();
        let price = null;
        const coinInfo = module.exports.getCoinInfo(req.params.coin);
        if(coinInfo){
            const connection = await module.exports.connection();
            let marketAddress = new PublicKey(coinInfo.marketAddress);
            let marketProgramId = new PublicKey(serumProgramId);
            let market = await Market.load(connection, marketAddress, {}, marketProgramId);
            let fills = await market.loadFills(connection, 10000);
            if(fills.length){
                price = fills[0].price;
            }
        }
        response.success = true;
        response.data = price;
        return response;
    },
    getOrderbook:async function(req, res){
        let response = new Response();
        try {
            const marketInfo = module.exports.getMarketInfo(null, req.params.pair);
            let orderbook = {
                asks:[],
                bids:[],
                market:null,
                marketAddress:null
            }
            if(marketInfo){
                const connection = await module.exports.connection();
                let marketAddress = new PublicKey(marketInfo.address);
                let marketProgramId = new PublicKey(serumProgramId);
                let market = await Market.load(connection, marketAddress, {}, marketProgramId);
                let bids = await market.loadBids(connection);
                let asks = await market.loadAsks(connection);
                for (let [price, size] of bids.getL2(20)) {
                    orderbook.bids.push({price: price, size: size});
                }
                for (let order of asks) {
                    orderbook.asks.push({price: order.price, size: order.size});
                }
                orderbook.market = marketInfo.pair;
                orderbook.marketAddress = marketInfo.address;
            }
            response.success = true;
            response.data = orderbook;
            return response;
        } catch(ex){
            console.log(ex)
            return response;
        }
    },
    getTime:async function(req, res){
        let response = new Response();
        response.success = true;
        response.data = moment().format("YYYY-MM-DD HH:mm");
        return response;
    },
    idoTest:async function(req, res){
        let response = new Response();
        let idoInfoData = {
            isIDOActive: false,
            sellDisabled: false,
            buyDisabled: false,
            tokenIdoName: "quest",
            tokenIdoTotalSell: 100000000,
            tokenIdoPrice: 0.0008,
            tokenIdoPriceBy: "USDT",
            minBuyPrice: 2,
            minBuyPcs: 0,
            maxBuyLimit:100000,
            idoStartDate: "2021-11-01 11:11",
            idoEndDate: "2021-11-21 21:21",
            idoStarted: false,
            idoEnded: false,
            secondMarketDate: "2021-11-22 22:22",
            currentTime: moment().format("YYYY-MM-DD HH:mm"),
            idoAsset: {name:"QUEST Coin", nameSmall:"Quest", mintAddress:"6ybxMQpMgQhtsTLhvHZqk8uqao7kvoexY6e8JmCTqAB1", marketAddress:"7QwEMFeKS8mPACndc9EzpgoqKbQhpBm1N4JCtzjGEyR7"},
            description: `TESTTESTTEST Quest койн нь Монголын анхны GameFi болон DeFi платформууд дээр ашиглагдах хэрэглээний токен юм. Quest төслийн багийнхан Coin Chest хэмээх сонирхолтой төслийг
            эхлүүлэхээр хөгжүүлэлтийн зардалд зарцуулах хөрөнгийг олон нийтээс татан төвлөрүүлэхээр Монголдоо анх удаа төвлөрсөн бус арилжааны биржээр дамжуулан IDO хийж байна. Уг төслийн талаар дэлгэрэнгүй мэдээллийг <a href="https://questcoin.org" target="_blank">https://questcoin.org</a> хаягаар аваарай. <a href="https://questcoin.gitbook.io/quest-coin/khereglegchiin-garyn-avlaga/ido-d-orolcokh-zaavar" target="_blank">IDO -оролцох заавар</a> болон <a href="https://questcoin.gitbook.io/quest-coin/khereglegchiin-garyn-avlaga/khetevch-neekh" target="_blank">Solana хэтэвч үүсгэх, цэнэглэх болон Dex.mn арилжааны бирж дээр арилжаа хийх зааврыг</a> үзнэ үү <a href="https://www.youtube.com/watch?v=4fh9H3gTl2o" target="_blank">IDO-д оролцох заавар видео үзэх</a>`,
            agreement: `Dex.mn арилжааны бирж нь хөндлөнгийн оролцогчгүй 100% төвлөрсөн бус ажиллагаатай. 
            Бирж дээр хийгдэж буй арилжаа нь нэг хүний хэтэвчээс нөгөө хүний хэтэвчрүү шууд P2P зарчмаар хийгддэг бөгөөд таны хэтэвчинд буй крипто 
            ассетуудын удирдлага нь таны 100% мэдэлд байх болно. Таны хэтэвчны мэдээлэл, үлдэгдэл, зарцуулалт зэрэг үйлдлүүд нь таны 
            баталгаажуулалтаар Solana блокчэйн сүлжээн дээр явагдаж байгаа бөгөөд эдгээр үйлдлүүдэд бид ямар ч хариуцлага хүлээхгүй болохыг 
            анхааруулж байна. IDO хийж байгаа койнд тө хөрөнгө оруулсанаар одоо эсвэл ирээдүйд ямар нэг санхүүгийн ашиг хүртэх баталгаа өгөхгүй бөгөөд та гарч болох
            эрсдэлийг 100% өөрөө хариуцах болно.`
        }
        idoInfoData.minBuyPcs = (idoInfoData.minBuyPrice / idoInfoData.tokenIdoPrice);
        const idoStartDate = moment(idoInfoData.idoStartDate).format("YYYY-MM-DD HH:mm:ss");
        const idoEndDate = moment(idoInfoData.idoEndDate).format("YYYY-MM-DD HH:mm:ss");
        const now = idoInfoData.currentTime;
        if(idoStartDate < now){
            idoInfoData.idoStarted = true;
        }
        if(idoEndDate < now){
            idoInfoData.idoEndDate = true;
        }
        response.success = true;
        response.data = idoInfoData;
        return response;
    },
    ido:async function(req, res){
        let response = new Response();
        let idoInfoData = {
            isIDOActive: false,
            sellDisabled: true,
            buyDisabled: true,
            tokenIdoName: "quest",
            tokenIdoTotalSell: 100000000,
            tokenIdoPrice: 0.0008,
            tokenIdoPriceBy: "USDT",
            minBuyPrice: 2,
            minBuyPcs: 0,
            maxBuyLimit:100000,
            idoStartDate: "2021-11-11 11:11",
            idoEndDate: "2021-11-21 21:21",
            idoStarted: false,
            idoEnded: false,
            secondMarketDate: "2021-11-22 22:22",
            currentTime: moment().format("YYYY-MM-DD HH:mm"),
            idoAsset: {name:"QUEST Coin", nameSmall:"Quest", mintAddress:"6ybxMQpMgQhtsTLhvHZqk8uqao7kvoexY6e8JmCTqAB1", marketAddress:"7QwEMFeKS8mPACndc9EzpgoqKbQhpBm1N4JCtzjGEyR7"},
            description: `Quest койн нь Монголын анхны GameFi болон DeFi платформууд дээр ашиглагдах хэрэглээний токен юм. Quest төслийн багийнхан Coin Chest хэмээх сонирхолтой төслийг
            эхлүүлэхээр хөгжүүлэлтийн зардалд зарцуулах хөрөнгийг олон нийтээс татан төвлөрүүлэхээр Монголдоо анх удаа төвлөрсөн бус арилжааны биржээр дамжуулан IDO хийж байна. Уг төслийн талаар дэлгэрэнгүй мэдээллийг <a href="https://questcoin.org" target="_blank">https://questcoin.org</a> хаягаар аваарай. <a href="https://questcoin.gitbook.io/quest-coin/khereglegchiin-garyn-avlaga/ido-d-orolcokh-zaavar" target="_blank">IDO -оролцох заавар</a> болон <a href="https://questcoin.gitbook.io/quest-coin/khereglegchiin-garyn-avlaga/khetevch-neekh" target="_blank">Solana хэтэвч үүсгэх, цэнэглэх болон Dex.mn арилжааны бирж дээр арилжаа хийх зааврыг</a> үзнэ үү <a href="https://www.youtube.com/watch?v=4fh9H3gTl2o" target="_blank">IDO -д оролцох заавар видео үзэх</a>`,
            agreement: `Dex.mn арилжааны бирж нь хөндлөнгийн оролцогчгүй 100% төвлөрсөн бус ажиллагаатай. 
            Бирж дээр хийгдэж буй арилжаа нь нэг хүний хэтэвчээс нөгөө хүний хэтэвчрүү шууд P2P зарчмаар хийгддэг бөгөөд таны хэтэвчинд буй крипто 
            ассетуудын удирдлага нь таны 100% мэдэлд байх болно. Таны хэтэвчны мэдээлэл, үлдэгдэл, зарцуулалт зэрэг үйлдлүүд нь таны 
            баталгаажуулалтаар Solana блокчэйн сүлжээн дээр явагдаж байгаа бөгөөд эдгээр үйлдлүүдэд бид ямар ч хариуцлага хүлээхгүй болохыг 
            анхааруулж байна. IDO хийж байгаа койнд тө хөрөнгө оруулсанаар одоо эсвэл ирээдүйд ямар нэг санхүүгийн ашиг хүртэх баталгаа өгөхгүй бөгөөд та гарч болох
            эрсдэлийг 100% өөрөө хариуцах болно.`
        }
        idoInfoData.minBuyPcs = (idoInfoData.minBuyPrice / idoInfoData.tokenIdoPrice);
        const idoStartDate = moment(idoInfoData.idoStartDate).format("YYYY-MM-DD HH:mm:ss");
        const idoEndDate = moment(idoInfoData.idoEndDate).format("YYYY-MM-DD HH:mm:ss");
        const now = idoInfoData.currentTime;
        if(idoStartDate < now){
            idoInfoData.idoStarted = true;
        }
        if(idoEndDate < now){
            idoInfoData.idoEnded = true;
        }
        response.success = true;
        response.data = idoInfoData;
        return response;
    }
}

module.exports = methods;