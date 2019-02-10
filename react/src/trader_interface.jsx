import React from 'react';
import './trader_interface.css';

class OrderbookGraph extends React.Component {
    render() {
        return (
            <div className="orderbookGraph">
              <img src="https://www.tradingview.com/x/5fOXrWWi" alt=""/>
            </div>
        )
    }
}

class TradeInput extends React.Component {
    render() {
        return (
            <div className="tradeInput">
              <b>Price</b>
              <input type="text"></input>
              <b>Volume</b>
              <input type="text"></input>
              <div className="tradeInputButtons">
                  <button className="buyButton" onClick={() => this.props.place_quote("BUY", 10)}>Buy</button>
                <button className="sellButton" onClick={() => this.props.place_quote("SELL", 15)}>Sell</button>
              </div>
            </div>
           );
    }
}

class OrderList extends React.Component {
    render() {
        const orders = this.props.orders.map(
            (order) => 
                <tr key={order.order_id}>
                  <td>{order.side}</td><td>{order.price}</td><td>{order.volume}</td>
                  <td><button className="cancelButton">X</button></td>
                </tr>
            )

        return (
            <div className="orderList">
              <table><tbody>
                <tr><td><b>Active Orders</b></td></tr>
                <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td><td></td></tr>
                {orders}
              </tbody></table>
            </div>
        );
    }
}

class TradeList extends React.Component {
    render() {
        const trades= this.props.trades.map(
            (trade) =>
                <tr key={trade.trade_id + trade.side}>
                  <td>{trade.side}</td><td>{trade.price}</td><td>{trade.volume}</td>
                </tr>
            )

        return (
            <div className="tradeList">
              <table><tbody>
                <tr><td><b>Trades</b></td></tr>
                <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td></tr>
                {trades}
              </tbody></table>
            </div>
           );
    }
}

class Orderbook extends React.Component {
    render() {
        let ask_levels = null
        let bid_levels = null

        if (this.props.orderbook.ask == null){
        } else {
            ask_levels = this.props.orderbook.ask.map(
                (level) => 
                    <tr key={level.price}>
                      <td><button className="buyButton" onClick={() => this.props.hit_trade("BUY", level.price)}>Buy</button></td>
                      <td className="bold">${level.price}</td><td>{level.volume}</td>
                    </tr>
            )
        }

        if (this.props.orderbook.ask == null){
        } else {
            bid_levels = this.props.orderbook.bid.map(
                (level) => 
                    <tr key={level.price}>
                      <td>{level.volume}</td><td className="bold">${level.price}</td>
                      <td><button className="sellButton" onClick={() => this.props.hit_trade("SELL", level.price)}>Sell</button></td>
                    </tr>
                )
        }

        return (
            <div>
              <table><tbody>
              <tr>
                <td className="bidHeader">Bid</td><td className="priceHeader">Price</td>
                <td className="askHeader">Ask</td>
              </tr>
              {ask_levels}
              {bid_levels}
              </tbody></table>
            </div>
        );
    }
}

class TraderInterface extends React.Component {
    render() {
        return (
            <div className="traderInterface">
              <div className="traderInputs">
                <div className="tradeInputAndOrderbook">
                  <TradeInput 
                    place_quote={(side, price) => this.props.trade(side, price, 10)}
                  />
                  <Orderbook 
                    orderbook={this.props.orderbook}
                    hit_trade={(side, price) => this.props.trade(side, price, 10)}
                  />
                </div>
                <div className="tradeListAndPnL">
                  <TradeList trades={this.props.trades} />
                  <OrderList orders={this.props.orders} />
                </div>
              </div>
            </div>
        );
    }
}

export default TraderInterface
