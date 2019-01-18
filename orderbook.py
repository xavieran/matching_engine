#!/usr/bin/env python

BUY = 0
SELL = 1

global TID
TID = 0

def reset_trade_id():
    global TID
    TID = 0

def generate_trade_id():
    global TID
    TID += 1
    return TID

class Trade:
    def __init__(self, trade_id, order_id, side, price, volume):
        self.trade_id = trade_id
        self.order_id = order_id
        self.side = side
        self.price = price
        self.volume = volume

    def __str__(self):
        return "[{} {} {} {}@{}]".format(
            self.trade_id,
            self.order_id, 
            "Buy" if self.side == BUY else "Sell",
            self.volume,
            self.price)

class Order:
    def __init__(self, order_id, side, price, volume):
        self.order_id = order_id
        self.side = side
        self.price = price
        self.volume = volume

    def __str__(self):
        return "[{} {} {}@{}]".format(
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
        
    def match(self, volume):
        """
        Returns a list of (order_id, volume) pairs
        """
        # TODO: Orders that take out the whole level should be left in
        matched_volume = 0
        trades = []
        
        to_remove = []
        
        for order, i in zip(self.level, range(len(self.level))):
            if volume == 0:
                break
            
            if volume < order.volume:
                matched_volume += volume
                order.volume -= volume
                self.volume -= volume

                tid = generate_trade_id()
                trades.append(Trade(tid, order.order_id, order.side, order.price, volume))
                break
            else:
                matched_volume += order.volume
                self.volume -= order.volume
                volume -= order.volume

                tid = generate_trade_id()
                trades.append(Trade(tid, order.order_id, order.side, order.price, order.volume))
                
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
        volume = order.volume
        trades = []
        matched_sum = 0

        for level in self.get_levels():
            if self.comp(order.price, level.price):
                level_trades, matched_volume = level.match(volume)
                trades.extend(level_trades)
                volume -= matched_volume
                matched_sum += matched_volume

                if level.volume == 0:
                    self.remove_level(level.price)

                if volume == 0:
                    break
            else:
                break
            
        return trades
            

class OrderBook:
    def __init__(self, trade_handler=lambda x: x):
        self.bid_levels = Levels(BUY)
        self.ask_levels = Levels(SELL)
        self._trade_handler = trade_handler

    def __str__(self):
        return str(self.ask_levels) + "\n" + str(self.bid_levels)

    def insert_order(self, order):
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

        self.handle_trades(trades)

    def cancel_order(self, order_id):
        if not self.bid_levels.cancel(order_id):
            if not self.ask_levels.cancel(order_id):
                return False

        return True

    def handle_trades(self, trades):
        if not trades:
            print("No trades")
        else:
            print(",".join(map(str, trades)))
            self._trade_handler(trades)
