const { Connection, PublicKey } = require('@solana/web3.js');
const { Market } =require('@project-serum/serum');

const serumProgramId = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const methods = {
    connection: async function(){
        const url = "https://api.mainnet-beta.solana.com";
        const connection = new Connection(url, 'recent')
        const version = await connection.getVersion()
        return connection
    },
    getMarketName: function(marketAddress){
        const marketInfos = [
            {address: "C1EuT9VokAKLiW7i2ASnZUvxDoKuKkCpDDeNxAptuNe4", name:"QUEST/USDT"}
        ];
        const marketInfo = marketInfos.find(srch=>srch.address == marketAddress);
        return marketInfo;
    },
    getTrade:async function(req, res){
        const marketInfo = module.exports.getMarketName(req.params.marketAddress);
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
                market: marketInfo.name,
                marketAddress: req.params.marketAddress,
                orderId: "",
                price: fill.price,
                side: fill.side,
                size: fill.size,
                time: 0
            }));
        }
        return trades;
    }
}

module.exports = methods;