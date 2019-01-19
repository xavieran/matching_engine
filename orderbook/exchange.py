#!/usr/bin/python

import orderbook

import logging
import pika 
from queue import Queue
import sys
from threading import Thread
import ujson 


class Exchange:
    def __init__(self):
        self.orderbook = orderbook.OrderBook(self.trade_handler)
        self.log = logging.getLogger("exchange")
        self.broadcast_queue = Queue()

        self.broadcast_thread = Thread(
            target=self.process_broadcast_queue,
            name="broadcast_thread", 
            daemon=True)
        self.broadcast_thread.start()

    def trade_handler(self, trades, order):
        self.log.info("Handling trades: {} with order: {}".format(",".join(map(str,trades)), order))
        # Create trades for aggressor
        opposing_trades = [
            orderbook.Trade(
                t.trade_id, 
                order.trader_id, 
                order.order_id, 
                order.side, 
                t.price, 
                t.volume)
            for t in trades]

        trades.extend(opposing_trades)

        for t in trades:
            self.broadcast_trade(t)

    def handle_message(self, message):
        """
        {"type":"insert", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "float", "volume": "unsigned"}
        {"type":"cancel", "trader_id": "str", "order_id": "uuid"}
        {"type":"trade", "trade_id": "uuid", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"update"}
        {"type":"orderbook", "bid": [], "ask": []}
        """
        self.log.info("Decoding message: {}".format(message))
        try:
            decoded = ujson.loads(message)
            type = decoded["type"]

            if type == "insert":
                self.handle_insert_message(decoded)
            if type == "cancel":
                self.handle_cancel_message(decoded)
            if type == "update":
                self.broadcast_orderbook()

        except ValueError as e:
            self.log.warn("Failed to decode message: {}".format(e))

    def handle_insert_message(self, msg):
        order = orderbook.Order(
            msg['trader_id'],
            msg['order_id'],
            orderbook.BUY if msg["side"] == "BUY" else orderbook.SELL,
            int(msg["price"]),
            int(msg["volume"]))

        self.log.info("Handling order: {}".format(str(order)))

        self.orderbook.insert_order(order)
        self.broadcast_orderbook()

    def handle_cancel_message(self, msg):
        order_id = msg["order_id"]
        trader_id = msg["trader_id"]

        self.log.info("Cancelling order_id: {} from {}".format(order_id, trader_id))
        self.orderbook.cancel_order(order_id)
        self.broadcast_orderbook()

    def broadcast_orderbook(self):
        self.log.info("Broadcasting orderbook:\n {}".format(str(self.orderbook)))
        dict = {
            "bid":[{"price":l.price, "volume": l.volume} for l in self.orderbook.bid_levels.get_levels()],
            "ask":[{"price":l.price, "volume": l.volume} for l in self.orderbook.ask_levels.get_levels()]}

        json = ujson.dumps(dict)
        self.broadcast_queue.put(json)

    def broadcast_trade(self, trade):
        self.log.info("Broadcasting trade: {}".format(trade))
        json = ujson.dumps({
            "type": "trade",
            "trader_id":trade.trader_id, 
            "order_id":trade.order_id,
            "side": "BUY" if trade.side == orderbook.BUY else "SELL",
            "price": trade.price,
            "volume":trade.volume})

        self.broadcast_queue.put(json)

    def process_broadcast_queue(self):
        while 1:
            message = self.broadcast_queue.get()
            print(message)

class Comms:
    def __init__(self):
        self.exchange = Exchange()

    def main(self, connection):
            
        channel = connection.channel()
        
        #try:
        for method_frame, properties, body in channel.consume('order_queue'):
            self.exchange.handle_message(body)
            channel.basic_ack(method_frame.delivery_tag)
        """except ValueError:
            # Cancel the consumer and return any pending messages
            requeued_messages = channel.cancel()
            print('Requeued %i messages' % requeued_messages)
            connection.close()"""


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    params = pika.ConnectionParameters(
        host="localhost", 
        port=5672,
        credentials=pika.PlainCredentials("rabbitmq","rabbitmq"))

    if sys.argv[1] == "c":
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue="order_queue")

        channel.basic_publish(
            exchange='',
            routing_key='order_queue',
            body=sys.argv[2])

        connection.close()

    else:
        connection = pika.BlockingConnection(params)
        comms = Comms()
        comms.main(connection)
