import './trader_interface.css'

import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import OrderbookGraph from './orderbook_graph.jsx'

import NumericInput from 'react-numeric-input'

import {Accordion, Icon} from 'semantic-ui-react'
import {Header} from 'semantic-ui-react'
import {Label} from 'semantic-ui-react'
import {Segment} from 'semantic-ui-react'
import {Slider} from 'react-semantic-ui-range'

import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'

import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

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
                mobile={true}
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
                mobile={true}
                onChange={(valueAsNumber, s, i) => this.setState({price: valueAsNumber})} />
            </div>
        )
        //format={(num) => "$" + num} 
    }
}

class HitLimitInput extends React.Component {
    render() {
        return (
            <div className="hitLimitInput">
              <Label pointing="right" size="medium" color='black'>Hit Limit</Label>
              <NumericInput 
                className="volumeInput" 
                min={1} 
                max={100000} 
                step={1} 
                precision={0} 
                value={this.props.volume} 
                size={6}
                mobile={true}
                onChange={(valueAsNumber, s, i) => this.props.onChange(valueAsNumber)} />
        </div>
        )
    }
}

class TradeInput extends React.Component {
    render() {
        return (
            <div>
              <QuoteInput side="sell" trade={this.props.place_quote}/>
              <QuoteInput side="buy" trade={this.props.place_quote} />
              <HitLimitInput 
                volume={this.props.hit_limit} 
                onChange={(volume) => this.props.hit_limit_change(volume)}/>
            </div>
        )
    }
}

    /*
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
              <Card className="smallMargins">
                <Card.Body>
                  <Card.Title>Active Orders</Card.Title>
                  <Table bordered striped hover >
                    <thead>
                      <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td><td></td></tr>
                    </thead>
                    <tbody>
                      {orders}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
        )
    }
}
*/


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
                <Segment>
                    <Header as='h3'>Active Orders</Header>
                  <Table bordered striped hover >
                    <thead>
                      <tr><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td><td></td></tr>
                    </thead>
                    <tbody>
                      {orders}
                    </tbody>
                  </Table>
              </Segment>
            </div>
        )
    }
}

class TradeList extends React.Component {
    render() {
        /*
        const trades= this.props.trades.map(
            (trade) =>
                <tr key={trade.trade_id + trade.side}>
                  <td>{trade.side}</td><td>{trade.price}</td><td>{trade.volume}</td>
                </tr>
            )
        */
        return (
            <div className="tradeList">
              <Segment>
                    <Header as='h3'>Trades</Header>
                    <BootstrapTable 
                      data={this.props.trades}
                      trClassName={(row, rowIndex) => row.side == "BUY" ? "tableRowBuy" : "table-row-sell"}
                      exportCSV={true}
                      height="400">
                      <TableHeaderColumn isKey hidden dataField='trade_id'>trade_id</TableHeaderColumn>
                      <TableHeaderColumn width="6em" dataField='side'>Side</TableHeaderColumn>
                      <TableHeaderColumn width="6em" dataField='price' dataFormat={(x) => "$" + x}>Price</TableHeaderColumn>
                      <TableHeaderColumn width="6em" dataField='volume'>Volume</TableHeaderColumn>
                      <TableHeaderColumn dataField='counterpart_id'>With</TableHeaderColumn>
                    </BootstrapTable>
              </Segment>
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
				  	      <button className="hitButton buyButton" onClick={() => this.props.hit_trade("BUY", level.price)}>{this.props.hit_limit}</button>
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
					      <button className="hitButton sellButton" onClick={() => this.props.hit_trade("SELL", level.price)}>{this.props.hit_limit}</button>
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

class HintInput extends React.Component {
    render(){
        return (
            <Form>
              <Form.Group controlId="formHint">
                <Form.Control 
                  as="textarea"
                  rows="2"
                  size="lg" 
                  type="text" 
                  placeholder="Enter hint" 
                  ref={(ref) => this.hint = ref}/>
                <Button 
                  size="lg" 
                  variant="primary" 
                  onClick={() => {
                      if (this.hint.value){
                          this.props.send_hint(this.hint.value)
                      }
                      this.hint.value=null
                  }}>
                  Send Hint
                </Button>
              </Form.Group>
            </Form>
        )
    }
}

class HintsDisplay extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            active: false
        }
    }

    render() {
        let header = <b>No hints</b>
        if (this.props.hints.length > 0){
            header = this.props.hints[0]
        }
        
        let content = null

        if (this.props.hints.length > 1){
            content = this.props.hints.slice(1).map((hint) => <div key={hint}>{hint}</div>)
        }

        return (
            <Segment>
            <Accordion>
              <Accordion.Title 
                active={this.state.active} 
                index={0} 
                as={Header}
                onClick={() => this.setState({active: !this.state.active})}>
                <Icon name='dropdown' />
                {header}
              </Accordion.Title>
              <Accordion.Content active={!this.state.active}>
               {content}
              </Accordion.Content>
            </Accordion>
            </Segment>
        )
    }
}

class RangeOrderbookGraph extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            value: 0
        }
    }

    render(){
        const settings = {
            start: 0,
            min: 0, 
            max: this.props.data.length,
            step: 5,
            onChange: (v) => this.setState({value: v})
        }
        return <div>
            <OrderbookGraph 
		      data={this.props.data.slice(this.state.value)}
              trade={[]}
          />
            <Label pointing="below">{this.state.value}</Label>
            <Slider discrete color="red" settings={settings} />
          </div>
    }
}

class TraderInterface extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            hit_limit: 1
        }
    }

    render() {
        return (
            <Container style={{'max-width':'3440px'}}>
              <Row>
                <Col>
                  <HintsDisplay hints={this.props.hints}/>
                  <Segment>
                  <RangeOrderbookGraph 
			        data={this.props.orderbook_updates}
                    trade={[]}
                  />
                </Segment>
                </Col>
              </Row>
              <Row className="smallMargins">
                <Col md="auto">
                    <Segment>
                      <Row>
                        <TradeInput 
                            place_quote={this.props.trade}
                            hit_limit_change={(hit_limit) => this.setState({hit_limit: hit_limit})}
                            hit_limit={this.state.hit_limit}
                        />
                      </Row>
                      <hr />
                      <Row style={{justifyContent: 'center'}}>
                        <Orderbook 
                          orderbook={this.props.orderbook}
                          hit_limit={this.state.hit_limit}
			              tradable={true}
                          hit_trade={(side, price) => this.props.trade(side, price, this.state.hit_limit)}
                        />
                      </Row>
                  </Segment>
                </Col>
                <Col xs="4" className="smallMargins" ><OrderList orders={this.props.orders} cancel={this.props.cancel}/></Col>
                <Col xs="6" className="smallMargins"><TradeList trades={this.props.trades} /></Col>
              </Row>
            </Container>
        )
    }
}

class MonitorInterface extends React.Component {
    render() {
        console.log(this.props)
        return (
            <div className="traderInterface">
              <RangeOrderbookGraph 
			    data={this.props.orderbook_updates}
				trade={[]}
              />
              <HintsDisplay hints={this.props.hints}/> 
              <HintInput 
                  send_hint={(hint) => this.props.hint(hint)}/>
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
