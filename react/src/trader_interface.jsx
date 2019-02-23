import './trader_interface.css'

import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import OrderbookGraph from './orderbook_graph.jsx'

import AnimateOnChange from 'react-animate-on-change'
import NumericInput from 'react-numeric-input'

import {Accordion, Icon} from 'semantic-ui-react'
import {Header} from 'semantic-ui-react'
import {Label} from 'semantic-ui-react'
import {Segment} from 'semantic-ui-react'
import {Slider} from 'react-semantic-ui-range'

import Button from 'react-bootstrap/Button'
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


class PnLRow extends React.Component {
    render() {
        const pnl = this.props.pnl
        if (!pnl){
            return <div />
        }

        const x = new Intl.NumberFormat('en-US', {style: 'currency', currencyDisplay: 'symbol', currency: 'USD'}).format
        return <tr>
                 <td><b>{this.props.trader_id}</b></td><td><b>{x(pnl.pnl)}</b></td><td><b>{x(pnl.price)}</b></td>
                 <td><b>{pnl.net_pos}</b></td><td><b>{x(pnl.avg_buy_px)}</b></td>
                 <td><b>{pnl.tot_buy}</b></td><td><b>{x(pnl.avg_sell_px)}</b></td><td><b>{pnl.tot_sell}</b></td>
               </tr>
    }
}


class PnlDisplay extends React.Component {
    render() {
        let pnls = null
        if (this.props.pnls){
            pnls = Object.entries(this.props.pnls).map((e) => <PnLRow key={e[0]} trader_id={e[0]} pnl={e[1]}/>)
        }

        return (
            <div className="pnlDisplay">
              <Table bordered>
                <thead>
                  <tr>
                    <td><b>Trader</b></td><td><b>PnL</b></td><td><b>Market</b></td>
                    <td><b>Net Pos</b></td><td><b>Avg Buy</b></td>
                    <td><b>Tot Buy</b></td><td><b>Avg Sell</b></td><td><b>Tot Sell</b></td>
                  </tr>
                </thead>
                <tbody>
                  {pnls}
                </tbody>
              </Table>
            </div>
        )
    }
}


class OrderList extends React.Component {
    render() {
        const orders = this.props.orders.sort((a, b) => a.price < b.price).map(
            (order) => 
                <tr key={order.order_id}>
                    <td><button className="cancelButton" onClick={() => this.props.cancel(order.order_id)}><Icon name="close" color="red"/></button></td>
                  <td>{order.side}</td><td>${order.price}</td><td>{order.volume}</td>
                </tr>
            )

        return (
            <div className="orderList">
              <Header as='h3'>Active Orders</Header>
              <Table bordered striped hover >
                <thead>
                  <tr><td><b></b></td><td><b>Side</b></td><td><b>Price</b></td><td><b>Volume</b></td></tr>
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
    constructor(props){
        super(props)
        this.state = {
            show_all: false
        }
    }

    toggle(){
        this.setState({show_all: !this.state.show_all})
    }

    render() {
        let trades = this.props.trades
        let button = <div><Icon name="minus"/></div>
        if (!this.state.show_all){
            if (trades)
                trades = trades.slice(0, 10)
            button = <div><Icon name="plus"/></div>
        }

        return (
            <div className="tradeList">
              <Segment>
                <Header as='h3'>Trades</Header>
                <Button onClick={() => this.toggle()}>{button}</Button>
                <BootstrapTable 
                  data={trades}
                  trClassName={(row, rowIndex) => row.side === "BUY" ? "tableRowBuy" : "table-row-sell"}
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


class VolumeLevel extends React.Component {
    render() {
        return <AnimateOnChange
            baseClassName="volume"
            animationClassName="volume-flash"
            animate={this.props.diff !== 0}>
            {this.props.volume}</AnimateOnChange>
    }
}

class OrderbookLevel extends React.Component {
    shouldComponentUpdate(nextProps){
        const curr_level = this.props.orderbook[this.props.side][this.props.level]
        const next_level = nextProps.orderbook[nextProps.side][nextProps.level]
        if (curr_level && next_level)
            return (curr_level.volume !== next_level.volume)

        return true
    }

    render() {
        const level = this.props.orderbook[this.props.side][this.props.level]
        if (!level) return null

        return <VolumeLevel volume={level.volume}/>
    }
}

class AskLevel extends React.Component {
    render() {
        const side = 'ask'
        const level = this.props.orderbook[side][this.props.level]
        if (!level) return null

        return <tr>
              <td>
              {this.props.tradable ? 
			    <button className="hitButton buyButton" onClick={() => this.props.hit("BUY", level.price)}>{this.props.hit_limit}</button>
                      : <div></div>}
              </td>
              <td className="bold">${level.price}</td>
              <td><OrderbookLevel orderbook={this.props.orderbook} side={side} level={this.props.level}/></td>
            </tr>
    }
}

class BidLevel extends React.Component {
    render() {
        const side = 'bid'
        const level = this.props.orderbook[side][this.props.level]
        if (!level) return null

        return <tr>
              <td><OrderbookLevel orderbook={this.props.orderbook} side={side} level={this.props.level}/></td>
              <td className="bold">${level.price}</td>
              <td>
              {this.props.tradable ? 
			    <button className="hitButton sellButton" onClick={() => this.props.hit("SELL", level.price)}>{this.props.hit_limit}</button>
                      : <div></div>}
              </td>
            </tr>
    }
}

class Orderbook extends React.Component {
    render() {
        return (
            <div className="orderbook">
              <table className="orderbookTable">
                <thead>
                  <tr>
                    <td className="bidHeader">Bid</td>
                    <td className="priceHeader">Price</td>
                    <td className="askHeader">Ask</td>
                  </tr>
                </thead>
                <tbody>
                  <AskLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={0}/>
                  <AskLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={1}/>
                  <AskLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={2}/>
                  <AskLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={3}/>
                  <AskLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={4}/>
                  <BidLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={0}/>
                  <BidLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={1}/>
                  <BidLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={2}/>
                  <BidLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={3}/>
                  <BidLevel hit={this.props.hit_trade} tradable={this.props.tradable} hit_limit={this.props.hit_limit} orderbook={this.props.orderbook} level={4}/>

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
                      if (this.hint.value)
                          this.props.send_hint(this.hint.value)
                      this.hint.value = null
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
        if (this.props.hints.length > 0)
            header = this.props.hints[0]
        
        let content = null

        if (this.props.hints.length > 1)
            content = this.props.hints.slice(1).map((hint) => <div key={hint}>{hint}</div>)

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
            step: 1,
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
        let pnl = {}
        pnl[this.props.trader_id] = this.props.pnls[this.props.trader_id]
        let trades = this.props.trades[this.props.trader_id]

        return (
            <Container style={{'maxWidth':'3440px'}}>
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
                <Col><Segment><PnlDisplay pnls={pnl}/><OrderList orders={this.props.orders} cancel={this.props.cancel}/></Segment></Col>
                <Col><TradeList trades={trades} /></Col>
              </Row>
            </Container>
        )
    }
}


class MonitorInterface extends React.Component {
    render() {
        return (
            <Container style={{'maxWidth':'3440px'}}>
              <Row>
                <Col>
                  <Segment>
                    <HintsDisplay hints={this.props.hints}/> 
                    <RangeOrderbookGraph 
			          data={this.props.orderbook_updates}
			          trade={[]}
                    />
                  </Segment>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Segment>
                    <Row style={{justifyContent: 'center'}}>
                      <Orderbook 
                        orderbook={this.props.orderbook}
				        tradable={false}
                      />
                    </Row>
                  </Segment>
                </Col>
                <Col><Segment><PnlDisplay pnls={this.props.pnls}/></Segment></Col>
                <Col>
                  <TradeList trades={this.props.trades} />
                </Col>
              </Row>
            </Container>
        )
    }
}


class AdminInterface extends React.Component {
    render() {
        return (
            <Container style={{'maxWidth':'3440px'}}>
              <Row>
                <Col>
                  <Segment>
                    <HintsDisplay hints={this.props.hints}/> 
                    <RangeOrderbookGraph 
			          data={this.props.orderbook_updates}
			          trade={[]}
                    />
                  </Segment>
                </Col>
              </Row>
              <Row>
                <Col>
                  <HintInput 
                    send_hint={(hint) => this.props.hint(hint)}/>
                    <Segment>
                      <Row style={{justifyContent: 'center'}}>
                        <Orderbook 
                          orderbook={this.props.orderbook}
				          tradable={false}
                        />
                      </Row>
                    </Segment>
                  </Col>
                <Col>
                  <TradeList trades={this.props.trades} />
                </Col>
              </Row>
            </Container>
        )
    }
}

export {TraderInterface, MonitorInterface, AdminInterface}
