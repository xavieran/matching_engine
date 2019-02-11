import ExchangeInterface from './exchange_interface.js';
import {TraderInterface, MonitorInterface} from './trader_interface.jsx';
import Login from './login_page.js';
import './index.css';

import Alert from 'react-bootstrap/Alert'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

import { Redirect } from 'react-router';
import { Route, BrowserRouter as Router } from 'react-router-dom'

import React from 'react';
import ReactDOM from 'react-dom';


class Root extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            exchange_host: "ws://le-chateaud:6789/",
            trader_id: null,
            connected: null, 
            orderbook: {
                bid: [],
                ask: []
            },
            orderbook_updates: [],
            orders: [],
            trades: [],
            pnl: {},
            hints: [
                "Depth of all the world's oceans in meters",
                "There are 7 oceans"]
        }
    }

    componentDidMount() {
        console.log("Mounted")
        this.exchange_interface = new ExchangeInterface(
            this.onopen.bind(this),
            this.onclose.bind(this),
            this.exchange_event.bind(this))

        this.exchange_interface.connect(this.state.exchange_host)
    }

    componentWillUnmount() {
        delete this.exchange_interface
    }

    exchange_event(){
        console.log("Updating state", this.exchange_interface)
        this.setState({
            exchange_host: this.exchange_host,
            orderbook: this.exchange_interface.orderbook,
            trades: this.exchange_interface.trades,
            orders: this.exchange_interface.orders,
            hints: this.exchange_interface.hints,
            orderbook_updates: this.exchange_interface.orderbook_updates,
            pnl: this.exchange_interface.pnl
        })
    }

    onopen(event){
        console.log("Received onopen", event);
        this.setState({connected: true})
        this.exchange_interface.send_login("")
    }

    onclose(event){
        console.log("Received onclose", event);
        this.setState({connected: false})
    }

    connect(){
        console.log("About to connect");
        this.exchange_interface.connect()
    }

    send_order(side, price, volume){
        this.exchange_interface.send_order(side, price, volume, this.state.trader_id) 
    }

    send_cancel(order_id){
        this.exchange_interface.send_cancel(order_id, this.state.trader_id)
    }

    send_hint(hint){
        this.exchange_interface.send_hint(hint, "")
    }

    login(trader_id)
    {
        console.log("Logging in as: ", trader_id)
        this.exchange_interface.send_login(trader_id)
        this.setState({trader_id: trader_id})
    }

    render(){
        return (
            <Router>
              <div>
                <Navbar bg="light">
                  <Navbar.Brand>
                    <Alert variant={this.state.connected ? "success" : "danger" }>
                      {this.state.connected ? "Connected" : "Not connected"}
                    </Alert>
                  </Navbar.Brand>
                  <Nav fill variant="pill">
                  <Nav.Item>
                    <Nav.Link href="/monitor">Monitor</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="/admin">Admin</Nav.Link>
                  </Nav.Item>

                  </Nav>
                </Navbar>
                <Route exact path="/" render={props => <Redirect push to="/login"/>}/>
                <Route exact path="/login" render={props => 
                  <Login 
                    login={this.login.bind(this)}
                    connected={this.state.connected}
                    trader_id={this.state.trader_id}
                    redirect={"/TraderInterface"}/>} />
                <Route exact path="/TraderInterface" render={props => {
                  if (this.state.trader_id == null){
                      return <Redirect push to="/" />
                  } else {
                      return <TraderInterface
                        trade={this.send_order.bind(this)}
                        cancel={this.send_cancel.bind(this)}
                        orderbook={this.state.orderbook}
						orderbook_updates={this.state.orderbook_updates}
                        orders={this.state.orders}
                        trades={this.state.trades}
                        hints={this.state.hints}/>
                  }}}
                />
                <Route exact path="/monitor" render={props => {
                  return <MonitorInterface
                    orderbook={this.state.orderbook}
                    orderbook_updates={this.state.orderbook_updates}
                    hints={this.state.hints}
                    trades={this.state.trades}/>}}
                />
                <Route exact path="/admin" render={props => {
                    return <MonitorInterface
                      hint={this.send_hint.bind(this)}
                      orderbook={this.state.orderbook}
                      orderbook_updates={this.state.orderbook_updates}
                      hints={this.state.hints}
                      trades={this.state.trades}/>
                }}
                />

              </div>
            </Router>
        )
    }
}

const root = <Root/>

ReactDOM.render(root, document.getElementById('root'))
