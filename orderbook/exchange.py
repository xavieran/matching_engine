#!/usr/bin/python

import orderbook

import asyncio
import logging
import pika 
from queue import Queue
import sys
from threading import Thread
import ujson 
import websockets


class Exchange:
    def __init__(self, broadcaster=None):
        self.orderbook = orderbook.OrderBook(self.trade_handler)
        self.trades = {}
        self.log = logging.getLogger("exchange")

        self.broadcaster = broadcaster

        self.broadcast_queue = Queue()

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
                t.volume)
            for t in trades]

        trades.extend(opposing_trades)

        for t in trades:
            tid = t.trader_id
            if not tid in self.trades:
                self.trades[tid] = []
            self.trades[tid].append(t)

            self.broadcast_trade(t)

    def handle_message(self, message):
        """
        {"type":"insert", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"cancel", "trader_id": "str", "order_id": "uuid"}
        {"type":"trade", "trade_id": "uuid", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"order", "trader_id": "str", "order_id": "uuid", "side": "BUY|SELL", "price": "int", "volume": "unsigned"}
        {"type":"sync_state", "trader_id":"str"}
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
            if type == "sync_state":
                self.handle_sync_state(decoded)

        except ValueError as e:
            self.log.warn("Failed to decode message: {}".format(e))

    def handle_sync_state(self, msg):
        tid = msg['trader_id']
        self.log.info("Syncing state for: {}".format(tid))
        orders = self.orderbook.get_orders(tid)
        trades = self.trades[tid] if tid in self.trades else []

        for o in orders:
            self.broadcast_order(o)

        for t in trades:
            self.broadcast_trade(t)

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

    def broadcast_order(self, order):
        self.log.info("Pushing order:\n {}".format(str(order)))
        dict = {
            "type":"order",
            "trader_id": order.trader_id,
            "order_id": order.order_id,
            "side": "BUY" if order.side == orderbook.BUY else "SELL",
            "price": order.price,
            "volume": order.volume}

        json = ujson.dumps(dict)
        self.broadcast_queue.put(json)

    def broadcast_orderbook(self):
        self.log.info("Pushing orderbook:\n {}".format(str(self.orderbook)))
        dict = {
            "type":"orderbook",
            "bid":[{"price":l.price, "volume": l.volume} for l in self.orderbook.bid_levels.get_levels()],
            "ask":[{"price":l.price, "volume": l.volume} for l in self.orderbook.ask_levels.get_levels()]}

        json = ujson.dumps(dict)
        self.broadcast_queue.put(json)

    def broadcast_trade(self, trade):
        self.log.info("Pushing trade: {}".format(trade))
        json = ujson.dumps({
            "type": "trade",
            "trader_id":trade.trader_id, 
            "counterpart_id":trade.counterpart_id,
            "order_id":trade.order_id,
            "side": "BUY" if trade.side == orderbook.BUY else "SELL",
            "price": trade.price,
            "volume":trade.volume})

        self.broadcast_queue.put(json)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    log = logging.getLogger("websockets")
    

    exchange = Exchange(broadcaster=None)

    USERS = set()
    TRADERS = {}

    def state_event():
        dict = {
            "type": "orderbook",
            "bid":[{"price":l.price, "volume": l.volume} for l in exchange.orderbook.bid_levels.get_levels()],
            "ask":[{"price":l.price, "volume": l.volume} for l in exchange.orderbook.ask_levels.get_levels()]}

        return ujson.dumps(dict)

    def users_event():
        return ujson.dumps({'type': 'users', 'count':len(USERS)})

    async def process_broadcast_queue():
        log.info("Process broadcast queue")
        while not exchange.broadcast_queue.empty():
            message = exchange.broadcast_queue.get()
            log.info("Broadcasting {}".format(message))
            await asyncio.wait([user.send(message) for user in USERS])

    async def notify_state():
        if USERS:
            message = state_event()
            await asyncio.wait([user.send(message) for user in USERS])

    async def notify_users():
        if USERS:
            message = users_event()
            await asyncio.wait([user.send(message) for user in USERS])

    async def register(websocket):
        print(websocket)
        USERS.add(websocket)
        await notify_users()

    async def unregister(websocket):
        USERS.remove(websocket)
        await notify_users()

    async def process_order(websocket, path):
        await register(websocket)
        try:
            await websocket.send(state_event())
            async for message in websocket:
                exchange.handle_message(message) 
                await notify_state()
                await process_broadcast_queue()
        finally:
            await unregister(websocket)

    asyncio.get_event_loop().run_until_complete(
        websockets.serve(process_order, '', 6789))
    asyncio.get_event_loop().run_forever()


