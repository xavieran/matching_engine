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
        this.trades = []
        this.orders = []

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
            console.log("WebSocket error")
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
        this.orderbook = data;
    }

    handle_order_ack(data){
        this.orders.push(data);
    }

    handle_cancel_ack(data){
        this.orders.push(data);
    }

    handle_trade(data){
        this.trades.unshift(data);
        this.update_pnl()
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

    send_trader(trader_id){
        let message = {
            type: "sync_state",
            trader_id: trader_id
        }

        console.log("Sending trader_id", trader_id);
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
}

export default ExchangeInterface
