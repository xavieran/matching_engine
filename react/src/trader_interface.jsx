import './trader_interface.css'
import OrderbookGraph from './orderbook_graph.jsx';

import NumericInput from 'react-numeric-input'

import Table from 'react-bootstrap/Table'

import React from 'react'

class QuoteInput extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            volume: 1,
            price: 1
        }
    }

    render() {
        return (
            <div className="quoteInput">
              <button 
                className={this.props.side + "Button"}
                onClick={() => this.props.trade(this.props.side.toUpperCase(), this.state.price, this.state.volume)}>
                {this.props.side}
              </button>
              <NumericInput 
                className="volumeInput" 
                min={1} 
                max={1000} 
                step={1} 
                precision={0} 
                value={this.state.volume}
                size={6}
                onChange={(valueAsNumber, s, i) => this.setState({volume: valueAsNumber})}
              />
              <b>@ $</b>
              <NumericInput 
                className="priceInput" 
                min={1} 
                max={100000} 
                step={1} 
                precision={0} 
                value={this.state.price} 
                size={6}
                onChange={(valueAsNumber, s, i) => this.setState({price: valueAsNumber})} />
            </div>
        )
        //format={(num) => "$" + num} 
    }
}

class TradeInput extends React.Component {
    render() {
        return (
            <div>
              <QuoteInput side="sell" trade={this.props.place_quote}/>
              <QuoteInput side="buy" trade={this.props.place_quote} />
            </div>
        )
    }
}

class OrderList extends React.Component {
    render() {
        const orders = this.props.orders.sort((a, b) => a.price < b.price).map(
            (order) => 
                <tr key={order.order_id}>
                  <td>{order.side}</td><td>{order.price}</td><td>{order.volume}</td>
                  <td><button className="cancelButton" onClick={() => this.props.cancel(order.order_id)}>X</button></td>
                </tr>
            )

        return (
            <div className="orderList">
              <Table bordered striped hover >
                <thead>
                  <tr><td><b>Active Orders</b></td></tr>
                  <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td><td></td></tr>
                </thead>
                <tbody>
                  {orders}
                </tbody>
              </Table>
            </div>
        )
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
              <Table bordered striped hover>
              <thead>
                <tr><td><b>Trades</b></td></tr>
                <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td></tr>
              </thead>
              <tbody>
                {trades}
              </tbody></Table>
            </div>
           )
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
                      <td>
				  	    {this.props.tradable ? 
				  	      <button className="buyButton" onClick={() => this.props.hit_trade("BUY", level.price)}>___</button>
						  : <div></div>}
					  </td>
                      <td className="bold">${level.price}</td><td>{level.volume}</td>
                    </tr>
            )
        }

        if (this.props.orderbook.bid == null){
        } else {
            bid_levels = this.props.orderbook.bid.map(
                (level) => 
                    <tr key={level.price}>
                      <td>{level.volume}</td><td className="bold">${level.price}</td>
                      <td>
					    {this.props.tradable ?
					      <button className="sellButton" onClick={() => this.props.hit_trade("SELL", level.price)}>___</button>
						  : <div></div>}
				      </td>
                    </tr>
                )
        }

        return (
            <div>
              <table className="orderbookTable">
                <thead>
                  <tr>
                    <td className="bidHeader">Bid</td>
                    <td className="priceHeader">Price</td>
                    <td className="askHeader">Ask</td>
                  </tr>
                </thead>
                <tbody>
                  {ask_levels}
                  {bid_levels}
                </tbody>
              </table>
            </div>
        )
    }
}

class TraderInterface extends React.Component {
    render() {
        return (
            <div className="traderInterface">
              <OrderbookGraph 
			    ask={[1,2,3,7,6,20,15,5]}
				bid={[1,2,3,7,6,20,15,5]}
				trade={[]}
		      />
              <div className="traderInputs">
                <div className="tradeInputAndOrderbook">
                  <TradeInput 
                    place_quote={this.props.trade}
                  />
                  <Orderbook 
                    orderbook={this.props.orderbook}
                    hit_trade={(side, price) => this.props.trade(side, price, 10)}
					tradable={true}
                  />
                </div>
                <div className="tradeListAndPnL">
                  <OrderList orders={this.props.orders} cancel={this.props.cancel}/>
                  <TradeList trades={this.props.trades} />
                </div>
              </div>
            </div>
        )
    }
}

class MonitorInterface extends React.Component {
    render() {
        return (
            <div className="traderInterface">
              <OrderbookGraph 
			    ask={[1,2,3,7,6,20,15,5]}
				bid={[1,2,3,7,6,20,15,5]}
				trade={[]}
		      />
              <div className="traderInputs">
                <div className="tradeInputAndOrderbook">
                  <Orderbook 
                    orderbook={this.props.orderbook}
					tradable={false}
                  />
                </div>
                <div className="tradeListAndPnL">
                  <TradeList trades={this.props.trades} />
                </div>
              </div>
            </div>
        )
    }
}

export {TraderInterface, MonitorInterface}
