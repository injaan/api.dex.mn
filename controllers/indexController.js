const { Connection, PublicKey } = require('@solana/web3.js');
const { Market } =require('@project-serum/serum');
const Response = require("../modules/response.class");

const serumProgramId = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
let lastPrices = {};
const methods = {
    connection: async function(){
        const url = "https://api.mainnet-beta.solana.com";
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
            {address: "7QwEMFeKS8mPACndc9EzpgoqKbQhpBm1N4JCtzjGEyR7", pair:"QUEST/USDT", bonfidapair:"QUESTUSDT"}
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
                orderbook.bids.ask.push({price: order.price, size: order.size});
            }
            orderbook.market = marketInfo.pair;
            orderbook.marketAddress = marketInfo.address;
        }
        response.success = true;
        response.data = orderbook;
        return response;
    }
}

module.exports = methods;