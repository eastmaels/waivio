// import { fetch } from 'whatwg-fetch';
import {singleton} from '../../../../../../platform/singletonPlatform';
import {publishSubscribe, destroyPublishSubscribe} from '../../../../../../platform/publishSubscribe';

export default class Connector {
  constructor(configuration) {
    this.listeners = [];
    this.client = null;
    this.subscriptions = [];
    this.options = JSON.parse(JSON.stringify(configuration.connectorOptions));
    this.options.pair = configuration.pair;
    this.createWebSocketConn();
  }

  addListener = listener => {
    this.listeners.push(listener);
  };

  getNews = opt => {
    if (this.options.newsUrl) {
      const url = `${this.options.newsUrl}&from=${opt.interval.from}&to=${
        opt.interval.to
        }&count=100`;
      this.getData(url, [opt.listener], opt);
    }
  };

  getEvents = opt => {
    if (this.options.eventsUrl) {
      let start = this.convertUnixToEventsAPIDate(opt.interval.from);
      let end = this.convertUnixToEventsAPIDate(opt.interval.to);
      const url = `${
        this.options.eventsUrl
        }?f=json&view=range&volatility=2&start=${start}&end=${end}&culture=${
        opt.lang
        }&countrycode=${opt.countries.join(',')}`;
      this.getData(url, [opt.listener], opt);
    }
  };

  convertUnixToEventsAPIDate = unixTimestamp => {
    let date = new Date(unixTimestamp * 1000);
    let yy = date.getUTCFullYear().toString();
    let mm = (date.getUTCMonth() + 1).toString();
    mm = mm.length > 1 ? mm : '0' + mm;
    let dd = date.getUTCDate().toString();
    dd = dd.length > 1 ? dd : '0' + dd;

    return `${yy}${mm}${dd}`;
  };

  getData = (url, listeners, opt) => {
    fetch(url)
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        const error = new Error(res.statusText);
        error.res = res;
        throw error;
      })
      .then(data => {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i].onConnectorMessage(data, listeners[i], opt);
        }
      })
      .catch(e => {
        console.warn(e.statusText);
      });
  };

  parseSignals = content => {
    const activeSignalsAC = JSON.parse(content).map(item => {
      return {
        id: item.resultuid,
        strength: item.quality,
        symbol: item.symbol,
        period: this.convertIntervalToPeriod(item.interval),
        pattern: item.pattern,
        patternEN: item.pattern,
        direction: item.direction,
        forecast: item.direction > 0 ? 'Buy' : 'Sell',
        isSgnlUpdated: false,
        relevant: item.relevant,
        patternEndTime: parseInt(item.patternendtime, 10),
        predictionPriceFrom: item.predictionpricefrom,
        predictionPriceTo: item.predictionpriceto,
        predictionTimeFrom: item.predictiontimefrom,
        predictionTimeTo: item.predictiontimeto,
        resistancex0: item.resistancex0,
        resistancex1: item.resistancex1,
        resistancey0: item.resistancey0,
        resistancey1: item.resistancey1,
        supportx0: item.supportx0,
        supportx1: item.supportx1,
        supporty0: item.supporty0,
        supporty1: item.supporty1,
        stoploss: item.stoploss,
        trend: item.trend,
        forecastPriceFrom: item.predictionpricefrom,
        forecastPriceTo: item.predictionpriceto,
        length: item.length,
        isVisible: false,
      };
    });

    return this.combineSignals(activeSignalsAC);
  };

  combineSignals = signals => {
    const result = {};

    for (let i = 0; i < signals.length; i++) {
      if (!result[signals[i].symbol]) {
        result[signals[i].symbol] = {};
      }

      result[signals[i].symbol][signals[i].id] = signals[i];
    }

    return result;
  };

  convertIntervalToPeriod = value => {
    switch (value) {
      case 1:
        return 'Minute';
      case 5:
        return 'Minute5';
      case 15:
        return 'Minute15';
      case 30:
        return 'Minute30';
      case 60:
        return 'Hour';
      case 240:
        return 'Hour4';
      case 480:
        return 'Hour8';
      case 1440:
        return 'Day';
      case 'Day':
        return 'Day';
      case 'Week':
        return 'Week';
      case 'Month':
        return 'Month';
      case 'Minute':
        return 'Minute';
      case 'Minute5':
        return 'Minute5';
      case 'Minute15':
        return 'Minute15';
      case 'Minute30':
        return 'Minute30';
      case 'Hour':
        return 'Hour';
      default:
        return 'Minute';
    }
  };

  convertValueToServerPeriod = value => {
    switch (value) {
      case '1':
        return 'Minute';
      case '5':
        return 'Minute5';
      case '15':
        return 'Minute15';
      case '30':
        return 'Minute30';
      case '60':
        return 'Hour';
      case 'Hour4':
        return 'Hour4';
      case 'Hour8':
        return 'Hour8';
      case 'Day':
        return 'Day';
      case 'Week':
        return 'Week';
      case 'Month':
        return 'Month';
      case 'Minute':
        return 'Minute';
      case 'Minute5':
        return 'Minute5';
      case 'Minute15':
        return 'Minute15';
      case 'Minute30':
        return 'Minute30';
      case 'Hour':
        return 'Hour';
      default:
        return 'Minute';
    }
  };

  getMiddlePrice = (ask, bid, precission) => ((parseFloat(ask) + parseFloat(bid)) / 2).toFixed(precission);

  normalizeDateTime = time => {
    let benchmark = 9;
    let length = time.toString().split('.')[0].length - 1;

    return time * Math.pow(10, benchmark - length);
  };

  processBarItemMid = (askBar, bidBar, dindex) => {
    return {
      low: this.getMiddlePrice(askBar.low, bidBar.low, dindex),
      high: this.getMiddlePrice(askBar.high, bidBar.high, dindex),
      open: this.getMiddlePrice(askBar.open, bidBar.open, dindex),
      close: this.getMiddlePrice(askBar.close, bidBar.close, dindex),
      date: askBar.date,
    };
  };

  processBarItemAskBid = (barItem, typeDataCapitalized, dindex) => {
    return {
      low: (barItem['low' + typeDataCapitalized] / 1000000).toFixed(dindex),
      high: (barItem['high' + typeDataCapitalized] / 1000000).toFixed(dindex),
      open: (barItem['open' + typeDataCapitalized] / 1000000).toFixed(dindex),
      close: (barItem['close' + typeDataCapitalized] / 1000000).toFixed(dindex),
      date: barItem.time / 1000.0,
    };
  };

  // //////////////////////////////

  createWebSocketConn = () => {
    this.client = {};
    this.client.connected = true;
    this.updateSubscription();
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i].onConnect();
    }
  };

  updateSubscription = () => {
    if (!this.client) {
      return;
    }

    let subscriptions = [];

    for (let i = 0; i < this.listeners.length; i++) {

      let hasSubs = false;

      for (let j = 0; j < subscriptions.length; j++) {
        if (subscriptions[j].id === this.listeners[i].id && subscriptions[j].period === this.listeners[i].getServerPeriod()) {
          hasSubs = true;
          break;
        }
      }

      if (!hasSubs) {
        subscriptions.push([this.listeners[i].pair.Name, this.listeners[i].getServerPeriod()]);
      }
    }

    let newSubs = JSON.stringify(subscriptions.sort());
    let oldSubs = JSON.stringify(this.subscriptions.sort());

    if (newSubs !== oldSubs) {
      this.unsubscribe();
      this.subscriptions = subscriptions;
      this.subscribe();
    }
  };

  subscribe = () => {
    const platform = this.getPlatformChooser();
    // pubSua.publishSubscribe('ChartData', this.onMessage);
    publishSubscribe(platform.platform);
    platform.platform.subscribe('ChartData', this.onMessage);

    if (this.client && this.client.connected) {
      for (let i = 0; i < this.subscriptions.length; i++) {
        let pair = this.subscriptions[i][0];
        // platform.subscribeChannel(pair);
        // pubSua.subscribe(pair, this.onRates);
        platform.platform.subscribe(pair, this.onRates);
      }
    }
  };

  unsubscribe = () => {
    const platform = this.getPlatformChooser();
    for (let i = 0; i < this.subscriptions.length; i++) {
      const pair = this.subscriptions[i][0];
      platform.unsubscribe(pair, this.onRates);
    }
    platform.unsubscribe('ChartData', this.onMessage);
    this.subscriptions = [];
  };

  close = () => {
    this.unsubscribe();
  };

  getBars = opt => {
    const pair = opt.pair.Name;
    const period = this.convertValueToServerPeriod(opt.period);
    opt.listener.waitFor = {pair: pair, period: period};
    if (this.client && this.client.connected) {
      let platform = this.getPlatformChooser();
      switch (opt.cmd) {
        case 'getFirstData':
          platform.platform.getChartData(opt.pair.Name, this.convertValueToServerPeriod(opt.period));
          break;
        case 'getDataOnUpdate':
          break;
        case 'getDataFromSeconds':
          break;
      }
    }
  };

  onRates = (a, b) => {
    this.onMessage(a, b);
  };

  onMessage = (a, b) => {
    console.log('onMessage', a, b);

    if (a.bidPrice) {
      this.process_Rates(a);
    } else if (a.type === 'Signals') {
      let data = this.parseSignals(b);
      let listeners = this.listeners;

      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          data = data[listeners[i].pair.Name];

          if (data) {
            listeners[i].onConnectorMessage(data, listeners[i]);
          }
        }
      }
    } else {
      let ratesData;

      if (a && Object.keys(a).length && a.quoteSecurity) {
        ratesData = {
          security: a.quoteSecurity,
          period: a.timeScale,
          bars: a.bars
        };

        for (let i = 0; i < this.listeners.length; i++) {
          let listener = this.listeners[i];
          if (listener.waitFor && listener.waitFor.pair === ratesData.security && listener.waitFor.period.toUpperCase() === ratesData.period && listener.data && listener.data.bid.length < ratesData.bars.length) {
            ratesData.bars = JSON.parse(JSON.stringify(ratesData.bars));
            this.proccess_Bars(ratesData, listener);
            return;
          }
          if (listener.data.bid[0] && ratesData.bars[ratesData.bars.length - 1].time / 1000 > listener.data.bid[0].date) {
            let result = {};
            let precission = this.getPrecission(ratesData.security);
            result.rates = [];
            result.mdata = {};
            result.mdata.args = {};
            result.mdata.cmd = 'update';
            result.mdata.args.bar = this.processDataItem(ratesData.bars[ratesData.bars.length - 1], precission);
            result.mdata.args.period = listener.getServerPeriod();
            listener.onConnectorMessage(result, listener);
            return;
          }
        }
      }
    }
  };

  process_Rates = (rescontent, flag) => {
    if (!rescontent) {
      return;
    }
    let rates = [];
    rates.push(this.process_ratesData_rates(rescontent));
    if (this.listeners && rates[0].bidPrice) {
      rates = this.normalizeRates(rates);
      let data = {rates: rates, investarenaTime: true};
      for (let i = 0; i < this.listeners.length; i++) {
        if (data.rates.length > 0) {
          this.listeners[i].onConnectorMessage(data, this.listeners[i]);
        }
      }
    }
  };

  normalizeRates = rates => {
    let dindex = this.getPrecission(rates[0].security);
    rates[0].bid = parseFloat(rates[0].bidPrice).toFixed(dindex);
    rates[0].ask = parseFloat(rates[0].askPrice).toFixed(dindex);
    rates[0].mid = this.getMiddlePrice(rates[0].ask, rates[0].bid, dindex);
    rates[0].timestamp = rates[0].timestamp / 1000.0;
    return rates;
  };

  process_ratesData_rates = ratesData => {
    ratesData.timestamp = this.normalizeDateTime(ratesData.timestamp);
    return ratesData;
  };

  proccess_Bars = (ratesData, listener) => {
    let data = this.process_ratesData_bars(ratesData);
    let opt = {callBack: listener.getFirstDataComplete, fromServer: true, numb: 501};
    if (data.bars && data.bars.length !== 0 && !listener.hasNextData) {
      data.bars.ask[0].isCurrentData = true;
      data.bars.bid[0].isCurrentData = true;
      data.bars.mid[0].isCurrentData = true;
    }

    listener.onConnectorMessage(data, listener, opt);
    listener.waitFor = null;
  };

  process_ratesData_bars = ratesData => {
    let bars = {ask: [], bid: [], mid: []};
    let precission = this.getPrecission(ratesData.security);
    if (ratesData.bars && ratesData.bars.length > 0) {
      for (let i = 0; i < ratesData.bars.length; i++) {
        if (precission > -1) {
          for (let i = 0; i < ratesData.bars.length; i++) {
            let item = this.processDataItem(ratesData.bars[i], precission);
            bars.ask.unshift(item.ask);
            bars.bid.unshift(item.bid);
            bars.mid.unshift(item.mid);
          }
        }
      }
    }
    return {bars: bars, precission: '' + precission};
  };

  processDataItem = (data, precission) => {
    let dataItem = {};

    let low = parseFloat(data.lowAsk / 1000000).toFixed(precission);
    let high = parseFloat(data.highAsk / 1000000).toFixed(precission);
    let open = parseFloat(data.openAsk / 1000000).toFixed(precission);
    let close = parseFloat(data.closeAsk / 1000000).toFixed(precission);
    dataItem.ask = {low: low, high: high, open: open, close: close, date: data.time / 1000};

    low = parseFloat(data.lowBid / 1000000).toFixed(precission);
    high = parseFloat(data.highBid / 1000000).toFixed(precission);
    open = parseFloat(data.openBid / 1000000).toFixed(precission);
    close = parseFloat(data.closeBid / 1000000).toFixed(precission);
    dataItem.bid = {low: low, high: high, open: open, close: close, date: data.time / 1000};

    low = this.getMiddlePrice(data.lowBid, data.lowAsk, precission);
    high = this.getMiddlePrice(data.highBid, data.highAsk, precission);
    open = this.getMiddlePrice(data.openBid, data.openAsk, precission);
    close = this.getMiddlePrice(data.closeBid, data.closeAsk, precission);
    dataItem.mid = {low: low, high: high, open: open, close: close, date: data.time / 1000};

    return dataItem;
  };

  getPrecission = security => {
    let tick = 100;
    let dindex = 5;
    let platform = this.getPlatformChooser();
    if (this.client && platform.platform.quotesSettings !== null) {
      for (let symbol in platform.platform.quotesSettings) {
        if (!platform.platform.quotesSettings.hasOwnProperty(symbol)) {
          continue;
        }
        if (security === symbol) {
          tick = platform.platform.quotesSettings[symbol].tickSize;
          dindex = 8 - ('' + tick).length;
          return dindex;
        }
      }
    }
    return -1;
  };

  process_ChartData = rescontent => {
    let data = this.process_chartDataBars(rescontent);
    if (this.listeners) {
      for (let i = 0; i < this.listeners.length; i++) {
        if (
          this.listeners[i].pair.Name !== rescontent.chart.security ||
          this.listeners[i].getServerPeriod() !== rescontent.chart.barType
        ) {
          continue;
        }
        let opt = {callBack: this.listeners[i].getFirstDataComplete, fromServer: true, numb: 501};
        if (data.bars[0]) {
          data.bars[0].isCurrentData = true;
        }
        this.listeners[i].onConnectorMessage(data, this.listeners[i], opt);
      }
    }
  };

  process_chartDataBars = data => {
    let active = data.chart.security;
    let tick = 100;
    let dindex = 5;
    let sp = 0.0001;
    if (data.userSettings && data.userSettings.securitySettings !== null) {
      for (let symbol in data.userSettings.securitySettings) {
        if (!data.userSettings.securitySettings.hasOwnProperty(symbol)) {
          continue;
        }
        if (active === symbol) {
          tick = data.userSettings.securitySettings[symbol].tickSize;
          dindex = 8 - ('' + tick).length;
          break;
        }
      }
    }
    let bars = {ask: [], bid: [], mid: []};
    let askBar;
    let bidBar;
    let midBar;
    for (let i = 0; i < data.chart.bars.length; i++) {
      askBar = this.processBarItemAskBid(data.chart.bars[i], 'Ask', dindex);
      bidBar = this.processBarItemAskBid(data.chart.bars[i], 'Bid', dindex);
      midBar = this.processBarItemMid(askBar, bidBar, dindex);
      bars.ask.unshift(askBar);
      bars.bid.unshift(bidBar);
      bars.mid.unshift(midBar);
    }
    return {
      bars: bars,
      precission: dindex,
    };
  };

  getPlatformChooser = () => {
    return singleton;
  };

  getAutochartistSignals = () => {
    let platform = this.getPlatformChooser();
    platform.GetAutochartistSignals();
  };
}
