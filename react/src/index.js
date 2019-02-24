import ExchangeInterface from './exchange_interface.js';
import {TraderInterface, MonitorInterface, AdminInterface} from './trader_interface.jsx';
import Login from './login_page.js';
import './index.css';

import {Menu, Icon} from 'semantic-ui-react'
import {Popup} from 'semantic-ui-react'
import {Label} from 'semantic-ui-react'

import { Redirect } from 'react-router';
import { Link, Route, BrowserRouter as Router } from 'react-router-dom'

import React from 'react';
import ReactDOM from 'react-dom';


class Root extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            exchange_host: "ws://le-chateaud:6789/",
            state: 'closed',
            trader_id: null,
            connected: null, 
            orderbook: {
                bid: [],
                ask: []
            },
            orderbook_updates: [],
            orders: [],
            trades: {},
            all_trades: [],
            pnls: {},
            hints: [
                "Depth of all the world's oceans in meters",
                "There are 7 oceans"]
        }
    }

    componentDidMount() {
        //console.log("Mounted")
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
        //console.log("Updating state", this.exchange_interface)
        this.setState({
            exchange_host: this.exchange_host,
            state: this.exchange_interface.state,
            orderbook: this.exchange_interface.orderbook,
            trades: this.exchange_interface.trades,
            all_trades: this.exchange_interface.all_trades,
            orders: this.exchange_interface.orders,
            hints: this.exchange_interface.hints,
            orderbook_updates: this.exchange_interface.orderbook_updates,
            pnls: this.exchange_interface.pnls
        })
    }

    onopen(event){
        //console.log("Received onopen", event);
        this.setState({connected: true})
        this.exchange_interface.send_login("")
    }

    onclose(event){
        //console.log("Received onclose", event);
        this.setState({connected: false})
    }

    connect(){
        //console.log("About to connect");
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

    send_state(state){
        this.exchange_interface.send_state(state, "")
    }

    login(trader_id)
    {
        this.exchange_interface.send_login(trader_id)
        // Dodgy, shouldn't we wait for the exchange to get back to us?
        this.setState({trader_id: trader_id})
    }

    render(){
        //<Menu.Item name="Admin" as={Link} to="/admin"><Icon name="spy" color="black" size="large"/></Menu.Item>
        return (
            <Router>
              <div>
                <Menu stackable>
                  <Menu.Item name={this.state.trader_id ? "Logout" : "Login"} href="/login"><Icon name="user" color="blue" size="large"/></Menu.Item>
                  <Menu.Item name="Monitor" as={Link} to="/monitor"><Icon name="chart line" color="blue" size="large"/></Menu.Item>
                  <Menu.Item name="Status" position="left">
                      <Label size="large" color={this.state.state === 'closed' ? 'yellow' : 'green'}>Exchange is: {this.state.state}</Label>
                  </Menu.Item>
                  <Menu.Item name="Connected" position="right">
                    {this.state.trader_id ? <b>{"Trader:" + this.state.trader_id + " "}</b> : null}
                    <Popup 
                      trigger={<Icon
                        name="exchange" 
                        color={this.state.connected ? "green" : "red"}
                        size="large"/>} 
                      content={this.state.connected ? "Connected to exchange" : "Not connected!"}/>
                  </Menu.Item>
                </Menu>
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
                        trader_id={this.state.trader_id}
                        cancel={this.send_cancel.bind(this)}
                        orderbook={this.state.orderbook}
						orderbook_updates={this.state.orderbook_updates}
                        orders={this.state.orders}
                        trades={this.state.trades}
                        pnls={this.state.pnls}
                        hints={this.state.hints}/>
                  }}}
                />
                <Route exact path="/monitor" render={props => {
                  return <MonitorInterface
                    orderbook={this.state.orderbook}
                    orderbook_updates={this.state.orderbook_updates}
                    hints={this.state.hints}
                    pnls={this.state.pnls}
                    trades={this.state.all_trades}/>}}
                />
                <Route exact path="/admin" render={props => {
                    return <AdminInterface
                      send_hint={this.send_hint.bind(this)}
                      state={this.state.state}
                      send_state={this.send_state.bind(this)}
                      orderbook={this.state.orderbook}
                      orderbook_updates={this.state.orderbook_updates}
                      hints={this.state.hints}
                      trades={this.state.all_trades}/>
                }}
                />
              </div>
            </Router>
        )
    }
}

const root = <Root/>

ReactDOM.render(root, document.getElementById('root'))
