import moment from 'moment'

function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16 | 0), v = c === 'x' ? r : ((r & 0x3) | 0x8);
		return v.toString(16);
	  });
}

class ExchangeInterface {
    constructor(
        onopen, 
        onclose,
        notify
    ){
        this.onopen = onopen;
        this.onclose = onclose;
        this.notify = notify

        this.pnl = {}
        this.orderbook = {}
        this.orderbook_updates = []
        this.trades = []
        this.orders = []
        this.hints = []

        this.websocket = null;
    }

    render(){
        return null;
    }

    connect(host){
        console.log("Opening connection to", host)
        this.websocket = new WebSocket(host)
        this.websocket.onopen = (event) => {
            console.log("WebSocket onopen")
            this.onopen(event)
        }
        this.websocket.onclose = (event) => {
            console.log("WebSocket onclose")
            this.onclose(event)
        }
        this.websocket.onerror = (event) => {
            console.log("WebSocket error", event)
        }
        this.websocket.onmessage = (event) => {
            console.log("WebSocket message", event)
            let data = JSON.parse(event.data)

            switch (data.type) {
                case 'orderbook':
                    console.log("Got orderbook", data)
                    this.handle_orderbook(data)
                    break;
                case 'trade':
                    console.log("Got trade", data)
                    this.handle_trade(data)
                    break;
                case 'order_ack':
                    console.log("Got order", data)
                    this.handle_order_ack(data)
                    break;
                case 'cancel_ack':
                    console.log("Got cancel", data)
                    this.handle_cancel_ack(data)
                    break;
                case 'hints':
                    console.log("Got hints", data)
                    this.handle_hints(data)
                    break;
                case 'sync_state':
                    console.log("Got sync_state", data)
                    this.handle_sync_state(data)
                    break;

                default:
                    console.error("Unsupported event", data)
                    break;
            }

            this.notify();
        }
    }

    update_pnl(){

    }

    handle_orderbook(data){
        this.orderbook = data
        this.orderbook.ask = this.orderbook.ask.reverse()
        this.handle_orderbook_update(this.orderbook)
    }

    handle_orderbook_update(data){
        let bid = null
        let ask = null
        let time = moment(data.time)

        if (data.bid.length !== 0){
            bid = data.bid[0].price
        }

        if (data.ask.length !== 0){
            ask = data.ask[data.ask.length - 1].price
        }
        const tick = {time: time, bid: bid, ask: ask}
        console.log("Updating orderbook history: ", tick)

        this.orderbook_updates.push(tick)
    }

    handle_order_ack(data){
        this.orders.push(data);
    }

    handle_cancel_ack(data){
        for (let i = 0; i < this.orders.length; i++){
            if (this.orders[i].order_id === data.order_id)
            {
                console.log("Removing order: ", this.orders[i])
                this.orders.splice(i, 1)
                break
            }
        }
    }

    handle_trade(data){
        this.trades.unshift(data);
        for (let i = 0; i < this.orders.length; i++){
            if (this.orders[i].order_id === data.order_id)
            {
                this.orders[i].volume -= data.volume
                if (this.orders[i].volume <= 0){
                    console.log("Removing order: ", this.orders[i])
                    this.orders.splice(i, 1)
                }
                break
            }
        }
        this.update_pnl()
    }

    handle_hints(data){
        console.log("Handling hints")
        this.hints = data.hints
    }

    handle_sync_state(data){
        console.log("Syncing state")
        this.handle_hints(data)

        for (let i = 0; i < data.trades.length; i++)
        {
            this.handle_trade(data.trades[i])
        }

        for (let i = 0; i < data.orders.length; i++)
        {
            this.handle_order_ack(data.orders[i])
        }

        for (let i = 0; i < data.orderbooks.length; i++)
        {
            this.handle_orderbook_update(data.orderbooks[i])
        }

        this.handle_orderbook(data["orderbook"])
    }

    send(data){
        this.websocket.send(JSON.stringify(data));
    }

    send_order(side, price, volume, trader_id){
        let order = {
            type:"insert", 
            trader_id: trader_id,
            order_id: uuidv4(),
            side: side,
            price: price,
            volume: volume
        }

        console.log("Sending order", order);
        this.send(order);
    }

    send_login(trader_id){
        let message = {
            type: "login",
            trader_id: trader_id
        }

        console.log("Logging in with: ", trader_id);
        this.send(message);
    }

    send_cancel(order_id, trader_id){
        let cancel = {
			type:"cancel",
			trader_id: trader_id, 
            order_id: order_id
        }

        console.log("Sending cancel", cancel);
        this.send(cancel)
    }

    send_hint(hint, trader_id){
        let message = {
            type:"hint",
            hint: hint,
			trader_id: trader_id
        }

        console.log("Sending hint", message);
        this.send(message)
    }
}

export default ExchangeInterface
