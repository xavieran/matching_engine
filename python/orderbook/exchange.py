#!/usr/bin/python

import orderbook

import asyncio
import datetime
import logging
import pika 
from queue import Queue
import sys
from threading import Thread
import ujson 
import uuid
import websockets

ALL = 0

class Exchange:
    def __init__(self, broadcaster=None):
        self.orderbook = orderbook.OrderBook(self.trade_handler)
        self.orderbook_updates = []
        self.trades = {}
        self.traders = {}
        self.log = logging.getLogger("exchange")
        self.time_fmt = "%Y%m%dT%H%M%S"
        self.broadcaster = broadcaster
        self.broadcast_queue = Queue()

    def login_handler(self, message, user):
        tid = message["trader_id"]
        self.log.info("Registering {}".format(tid))
        self.traders[tid] = user

    def trade_handler(self, trades, order):
        self.log.info("Handling trades: {} with order: {}".format(",".join(map(str,trades)), order))
        # Create trades for aggressor
        opposing_trades = [
            orderbook.Trade(
                t.trade_id, 
                t.counterpart_id,
                t.trader_id,
                order.order_id, 
                order.side, 
                t.price, 
                t.volume, 
                t.time)
            for t in trades]

        trades.extend(opposing_trades)

        for t in trades:
            tid = t.trader_id
            if not tid in self.trades:
                self.trades[tid] = []
            self.trades[tid].append(t)

            self.broadcast_trade(t, [self.traders[tid]])

    def handle_message(self, message, user):
        """
        {"type":"insert", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"cancel", "trader_id": "str", "order_id": "uuid"}
        {"type":"trade", "trade_id": "uuid", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"order", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"login", "trader_id":"str"}
        {"type":"sync_state", "trader_id":"str"}
        {"type":"orderbook", "bid": [], "ask": []}
        """
        self.log.info("Decoding message: {}".format(message))
        try:
            decoded = ujson.loads(message)
            type = decoded["type"]
            if type == "login":
                self.login_handler(decoded, user)
            else:
                if not decoded["trader_id"] in self.traders:
                    self.log.warn("Trader {} has not logged in".format(decoded["trader_id"]))
                    return 
                
                if type == "insert":
                    self.handle_insert_message(decoded)
                elif type == "cancel":
                    self.handle_cancel_message(decoded)

        except ValueError as e:
            self.log.warn("Failed to decode message: {}".format(e))

    def handle_sync_state(self, msg, recipients):
        tid = msg['trader_id']
        self.traders.add(tid)
        self.log.info("Syncing state for: {}".format(tid))
        orders = self.orderbook.get_orders(tid)
        trades = self.trades[tid] if tid in self.trades else []

        for ob in self.orderbook_updates:
            self.broadcast_queue.put((ob, recipients))

        for o in orders:
            self.broadcast_order(o, recipients)

        for t in trades:
            self.broadcast_trade(t, recipients)

    def handle_insert_message(self, msg):
        price = int(msg["price"])
        volume = int(msg["volume"])

        order = orderbook.Order(
            msg['trader_id'],
            msg['order_id'],
            orderbook.BUY if msg["side"] == "BUY" else orderbook.SELL,
            int(msg["price"]),
            int(msg["volume"]))

        self.log.info("Handling order: {}".format(str(order)))

        traded = self.orderbook.insert_order(order)
        if not traded == True:
            tid = order.trader_id
            self.broadcast_order(order, [self.traders[tid]])

        self.broadcast_orderbook(ALL)

    def handle_cancel_message(self, msg):
        order_id = msg["order_id"]
        trader_id = msg["trader_id"]

        self.log.info("Cancelling order_id: {} from {}".format(order_id, trader_id))

        if self.orderbook.cancel_order(order_id):
            self.broadcast_cancel(msg, [self.traders[trader_id]])
            self.broadcast_orderbook(ALL)

    def broadcast_cancel(self, cancel, recipients):
        self.log.info("Pushing cancel_ack: {}".format(str(cancel)))
        dict = {
            "type":"cancel_ack",
            "trader_id": cancel["trader_id"],
            "order_id": cancel["order_id"]}

        json = ujson.dumps(dict)
        self.broadcast_queue.put((json, recipients))

    def broadcast_order(self, order, recipients):
        self.log.info("Pushing order_ack: {}".format(str(order)))
        dict = {
            "type":"order_ack",
            "trader_id": order.trader_id,
            "order_id": order.order_id,
            "side": "BUY" if order.side == orderbook.BUY else "SELL",
            "price": order.price,
            "volume": order.volume}

        json = ujson.dumps(dict)
        self.broadcast_queue.put((json, recipients))

    def broadcast_orderbook(self, recipients):
        self.log.info("Pushing orderbook:\n {}".format(str(self.orderbook)))
        dict = {
            "type":"orderbook",
            "bid":[{"price":l.price, "volume": l.volume} for l in self.orderbook.bid_levels.get_levels()],
            "ask":[{"price":l.price, "volume": l.volume} for l in self.orderbook.ask_levels.get_levels()],
            "time":datetime.datetime.utcnow().strftime(self.time_fmt)}

        json = ujson.dumps(dict)
        self.orderbook_updates.append(json)
        self.broadcast_queue.put((json, recipients))

    def broadcast_trade(self, trade, recipients):
        self.log.info("Pushing trade: {}".format(trade))
        json = ujson.dumps({
            "type": "trade",
            "trader_id":trade.trader_id, 
            "counterpart_id":trade.counterpart_id,
            "trade_id":trade.trade_id,
            "order_id":trade.order_id,
            "side": "BUY" if trade.side == orderbook.BUY else "SELL",
            "price": trade.price,
            "volume":trade.volume,
            "time":trade.time.strftime(self.time_fmt)})

        self.broadcast_queue.put((json, recipients))

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    log = logging.getLogger("websockets")
    
    exchange = Exchange(broadcaster=None)
    USERS = {}

    async def process_broadcast_queue():
        log.info("Process broadcast queue")
        while not exchange.broadcast_queue.empty():
            message, recipients = exchange.broadcast_queue.get()
            if recipients == ALL:
                log.info("Broadcasting {} to all users".format(message))
                await asyncio.wait([user.send(message) for user in USERS.values()])
            else:
                await asyncio.wait([user.send(message) for user in recipients])

    async def register(websocket):
        log.info("New websocket connection opened {}".format(str(websocket)))
        USERS[websocket] = websocket

    async def unregister(websocket):
        log.info("Websocket connection closed {}".format(str(websocket)))
        del USERS[websocket]

    async def handle_message(websocket, path):
        await register(websocket)
        try:
            async for message in websocket:
                exchange.handle_message(message, websocket)
                await process_broadcast_queue()
        finally:
            await unregister(websocket)
    
    port = 6789
    log.info("Listening on: {}".format(port))
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(handle_message, '', port))
    asyncio.get_event_loop().run_forever()

