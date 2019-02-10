import React from 'react';
import ReactDOM from 'react-dom';

import { Route, BrowserRouter as Router } from 'react-router-dom'

import ExchangeInterface from './exchange_interface.js';
import TraderInterface from './trader_interface.jsx';
import Login from './login_page.js';
import './index.css';

class Main extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            exchange_host: "ws://le-chateaud:6789/",
            orderbook: {
                bid: [],
                ask: []
            },
            orders: [],
            trades: [],
            pnl: {}
        }

        this.exchange_interface = new ExchangeInterface(
            this.onopen.bind(this),
            this.onclose.bind(this),
            this.exchange_event.bind(this))

        this.connect()
    }

    exchange_event(){
        console.log("Updating state", this.exchange_interface)
        this.setState({
            exchange_host: this.exchange_host,
            orderbook: this.exchange_interface.orderbook,
            trades: this.exchange_interface.trades,
            orders: this.exchange_interface.orders,
            pnl: this.exchange_interface.pnl
        })
    }

    onopen(event){
        console.log("Received onopen", event);
    }

    onclose(event){
        console.log("Received onclose", event);
    }

    connect(){
        console.log("About to connect");
        this.exchange_interface.connect(this.state.exchange_host)
    }

    send_order(side, price, volume){
        this.exchange_interface.send_order(side, price, volume, "aj")
    }

    render() {
        return (
			<div className="main">
              <div className="main-trader-interface">
                <TraderInterface 
                  trade={this.send_order.bind(this)}
                  orders={this.state.orders}
                  trades={this.state.trades}
                  orderbook={this.state.orderbook}
                />
			  </div>
			</div>
	    );
    }
}


const routing = (
  <Router>
    <div>
      <Route exact path="/" component={Login} />
      <Route path="/TraderInterface" component={Main} />
    </div>
  </Router>
) 

ReactDOM.render(routing, document.getElementById('root'))
