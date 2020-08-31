var path = require('path');
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var axios = require('axios');
var port = process.env.PORT || 3000;
var request = require('request');

var cyan = '\x1b[36m%s\x1b[0m';

app.use(cors());

var whitelist = ['http://localhost:8080', 'http://localhost:8080/holdings', 'http://paradimer.herokuapp.com', 'https://paradimer.herokuapp.com'];

var corsOptionsDelegate = function(req, callback) {
    var corsOptions;
    if( whitelist.indexOf(req.header('Origin')) !== -1 ){
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function getQuery(req){
    var query = req.query;
    return query;
}

app.get('/', (req, res) => {
    res.send('Everything is working great');
});

//Bittrex
app.get('/bittrex/getticker*', cors(), (req, res) => {
    var query = getQuery(req);
    var market = query.market;
    var url = 'http://api.bittrex.com/api/v1.1/public/getticker?market=' + market;
    
    axios.get(url)
    .then((response) => {
        var data = response.data;
        var result = data.result;
        var lastPrice = result.Last;
        var output = 'The last price is: ' + lastPrice;
            console.log(output);
        res.header('Access-Control-Allow-Origin', "*");
        res.status(200).json(result);
    })
    .catch((error) => {
        console.log(error);
    });
});

//Binance
app.get('/binance/avgprice*', cors(), (req, res) => {
    var query = getQuery(req);
    var symbol = query.symbol;
    var tradingPair = 'USDT';
    if( query.pair !== undefined ){
        tradingPair = query.pair;
    }
    
    var url = 'http://api.binance.com/api/v3/avgPrice?symbol=' + symbol + tradingPair;
    axios.get(url)
    .then((response) => {
        var data = response.data;
        var avgPrice = data.price;
        var output = 'The average price is: ' + avgPrice;
        console.log(output);
        res.header('Access-Control-Allow-Origin', "*");
        res.status(200).json(data);
    }).catch((error) => {
        console.log('Error in route: Binance > avgprice', error); 
    });
});

//Kucoin
app.get('/kucoin/spotprice*', cors(), (req, res) => {
    var query = getQuery(req);
    var symbol = query.symbol;
    var tradingPair = 'USDT';
    if( query.pair !== undefined ){
        tradingPair = query.pair;
    }
    
    var url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}-${tradingPair}`;
    
    axios.get(url)
    .then((response) => {
        var data = response.data.data;
        var askPrice = data.bestAsk;
        var bidPrice = data.bestBid;
        var output = 'The best bid price is: ' + bidPrice;
        console.log(output);
        res.header('Access-Control-Allow-Origin', "*");
        res.status(200).json(data);
    }).catch((error) => {
        console.log('Error in route: KuCoin > spotprice', error); 
    });
});

//Coinbase
app.get('/coinbase/spotprice*', (req, res) => {
    var query = getQuery(req);
    var symbol = query.symbol;
    
    var url = 'https://api.coinbase.com/v2/prices/' + symbol + '-USD/spot';
    axios.get(url)
    .then((response) => {
        var data = response.data;
        var output = data.data.amount;
        console.log(output);
        res.header('Access-Control-Allow-Origin', "*");
        res.status(200).json(data);
    }).catch((error) => {
        console.log('Error in route: Coinbase > spotprice', error);
    });
});

//HitBTC
app.get('/hitbtc/ticker*', (req, res) => {
    var query = getQuery(req);
    var symbol = query.symbol;
    
    var url = 'https://api.hitbtc.com/api/2/public/ticker/' + symbol + 'USD';
    axios.get(url)
    .then((response) => {
        var data = response.data;
        var output = data.last;
        console.log(output);
        res.header('Access-Control-Allow-Origin', "*");
        res.status(200).json(data);
    }).catch((error) => {
        console.log('Error in route: HitBTC > ticker', error);
    });
});
/*
// Coinbase
function cbPrice(symbol){

  var reply = UrlFetchApp.fetch(baseUrl + query);
  var response = JSON.parse(reply);
  var output = response.data.amount;
  return output;
  ;
}

*/
app.listen(port, () => {
   console.log('Server is up!'); 
});