#!/usr/bin/env python

import datetime
import logging
import uuid

BUY = 0
SELL = 1

def generate_trade_id():
    return str(uuid.uuid4())

class Trade:
    def __init__(self, trade_id, trader_id, counterpart_id, order_id, side, price, volume, time):
        self.trade_id = trade_id
        self.trader_id = trader_id
        self.counterpart_id = counterpart_id
        self.order_id = order_id
        self.side = side
        self.price = price
        self.volume = volume
        self.time = time

    def __str__(self):
        return "[{} {} {} {} {}@{} with {}]".format(
            self.trade_id,
            self.trader_id,
            self.order_id, 
            "Buy" if self.side == BUY else "Sell",
            self.volume,
            self.price,
            self.counterpart_id)

class Order:
    def __init__(self, trader_id, order_id, side, price, volume):
        self.trader_id = trader_id
        self.order_id = order_id
        self.side = side
        self.price = price
        self.volume = volume

    def __str__(self):
        return "[{} {} {} {}@{}]".format(
            self.trader_id,
            self.order_id, 
            "Buy" if self.side == BUY else "Sell",
            self.volume,
            self.price)

class Level:
    def __init__(self, price, side):
        self.price = price
        self.side = side
        self.level = []
        self.volume = 0
            
    def __str__(self):
        return "{} {}@{} - {}".format(
            "Buy" if self.side == BUY else "Sell",
            self.volume,
            self.price,
            ",".join(map(str, self.level)))

    def clear(self):
        self.volume = 0
        self.level = []

    def insert(self, order):
        assert order.price == self.price
        assert order.side == self.side
        assert order.order_id not in [o.order_id for o in self.level]
        self.level.append(order)
        self.volume += order.volume

    def cancel(self, order_id):
        for order, i in zip(self.level, range(len(self.level))):
            if order_id == order.order_id:
                self.level.pop(i)
                self.volume -= order.volume
                return True

        return False
        
    def match(self, opposing_order):
        """
        Returns a list of (order_id, volume) pairs
        """
        # TODO: Orders that take out the whole level should be left in
        matched_volume = 0
        trades = []
        
        to_remove = []
        
        for order, i in zip(self.level, range(len(self.level))):
            if opposing_order.volume == 0:
                break
            
            if opposing_order.volume < order.volume:
                matched_volume += opposing_order.volume
                order.volume -= opposing_order.volume
                self.volume -= opposing_order.volume

                tid = generate_trade_id()
                trades.append(Trade(tid, order.trader_id, opposing_order.trader_id, order.order_id, order.side, order.price, opposing_order.volume, datetime.datetime.utcnow()))
                opposing_order.volume = 0
                break
            else:
                matched_volume += order.volume
                self.volume -= order.volume
                opposing_order.volume -= order.volume

                tid = generate_trade_id()
                trades.append(Trade(tid, order.trader_id, opposing_order.trader_id, order.order_id, order.side, order.price, order.volume, datetime.datetime.utcnow()))
                
                to_remove.append(order.order_id)
        
        self.level = [o for o in self.level if not (o.order_id in to_remove)]

        return trades, matched_volume


class Levels:
    """
    Bid levels are determined by setting side to BUY

    Levels are ordered such that Levels.price[0] is the best price.
    For bid levels, the highest price is the best price
    """
    def __init__(self, side):
        self.side = side
        self.levels = {}
        self.prices = []
        self.comp = (lambda x, y: x <= y) if side == BUY else (lambda x, y: x >= y)
        self.log = logging.getLogger("bid_levels" if side == BUY else "ask_levels")

    def __str__(self):
        if self.side == BUY:
            levels = self.get_levels()
        else:
            levels = reversed(self.get_levels())
            
        return "\n".join([str(level) for level in levels])

    def add_level(self, price):
        assert price not in self.levels
        self.levels[price] = Level(price, self.side)
        self.prices.append(price)
        self.prices = sorted(self.prices, reverse=self.side == BUY)
        
    def remove_level(self, price):
        assert price in self.levels and price in self.prices
        assert self.levels[price].volume == 0
        del self.levels[price]
        self.prices = [p for p in self.prices if p != price]
        
    def get_levels(self):
        return [self.levels[price] for price in self.prices]
    
    def cancel(self, order_id):
        for level in self.levels.values():
            if level.cancel(order_id):
                if level.volume == 0:
                    self.remove_level(level.price)
                return True

        return False
            
    def insert(self, order):
        assert order.side == self.side
        if order.price not in self.prices:
            self.add_level(order.price)

        self.levels[order.price].insert(order)

    def match(self, order):
        """
        If these are orders on the bid. (i.e. I am will to buy from you),
        then the aggressing order price must be <= to the level price.
        """
        self.log.info("Trying to match order: {}".format(str(order)))
        trades = []
        matched_sum = 0

        for level in self.get_levels():
            if self.comp(order.price, level.price):
                level_trades, matched_volume = level.match(order)
                trades.extend(level_trades)
                matched_sum += matched_volume

                if level.volume == 0:
                    self.remove_level(level.price)

                if order.volume == 0:
                    break
            else:
                break
            
        return trades
            

class OrderBook:
    def __init__(self, trade_handler=lambda x, y: None):
        self.bid_levels = Levels(BUY)
        self.ask_levels = Levels(SELL)
        self._trade_handler = trade_handler
        self.log = logging.getLogger("orderbook")

    def __str__(self):
        return str(self.ask_levels) + "\n" + str(self.bid_levels)

    def get_orders(self, trader_id):
        orders = []
        for level in self.bid_levels.get_levels():
            for order in level.level:
                if order.trader_id == trader_id:
                    orders.append(order)
        for level in self.ask_levels.get_levels():
            for order in level.level:
                if order.trader_id == trader_id:
                    orders.append(order)
        return orders

    def insert_order(self, order):
        self.log.info("Inserting order: {}".format(str(order)))

        trades = None

        if order.side == BUY:
            if self.ask_levels.prices and order.price >= self.ask_levels.get_levels()[0].price:
                trades = self.ask_levels.match(order)
            else:
                self.bid_levels.insert(order)

        if order.side == SELL:
            if self.bid_levels.prices and order.price <= self.bid_levels.get_levels()[0].price:
                trades = self.bid_levels.match(order)
            else:
                self.ask_levels.insert(order)

        self.handle_trades(trades, order)

    def cancel_order(self, order_id):
        if not self.bid_levels.cancel(order_id):
            if not self.ask_levels.cancel(order_id):
                return False

        return True

    def handle_trades(self, trades, order):
        if trades:
            self.log.info("Traded: {} with order: {}".format(",".join(map(str, trades)), order))
            self._trade_handler(trades, order)
