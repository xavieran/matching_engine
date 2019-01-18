#!/usr/bin/env python
import logging
logging.basicConfig(level=logging.DEBUG)

import orderbook.orderbook as orderbook

import unittest

class OrderBookTest(unittest.TestCase):
    def test_insert_order(self):
        "Test Orderbook Insert Order"
        saved_trades = []
        def trade_handler(trades, order_id):
            saved_trades.extend(trades)

        ob = orderbook.OrderBook(trade_handler)
        
        ob.insert_order(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))
        ob.insert_order(orderbook.Order("trader1", 1, orderbook.BUY, 10, 3))
        self.assertEqual(ob.bid_levels.prices, [10])
        self.assertEqual(saved_trades, [])

        ob.insert_order(orderbook.Order("trader1", 2, orderbook.SELL, 11, 7))
        ob.insert_order(orderbook.Order("trader1", 3, orderbook.SELL, 12, 4))

        self.assertEqual(ob.ask_levels.prices, [11, 12])
        self.assertEqual(saved_trades, [])

        print(ob)

        ob.insert_order(orderbook.Order("trader1", 4, orderbook.SELL, 10, 10))

        self.assertEqual(ob.bid_levels.prices, []) 
        self.assertEqual(len(saved_trades), 2) 
        print(ob)

    def test_cancel_order(self):
        "Test Orderbook Insert Order"
        ob = orderbook.OrderBook()
        
        ob.insert_order(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))
        ob.insert_order(orderbook.Order("trader1", 1, orderbook.BUY, 10, 3))
        self.assertEqual(ob.bid_levels.prices, [10])

        ob.insert_order(orderbook.Order("trader1", 2, orderbook.SELL, 11, 7))
        ob.insert_order(orderbook.Order("trader1", 3, orderbook.SELL, 12, 4))
        self.assertEqual(ob.ask_levels.prices, [11, 12])

        print(ob)

        self.assertEqual(ob.cancel_order(2), True)
        self.assertEqual(ob.bid_levels.prices, [10])
        self.assertEqual(ob.ask_levels.prices, [12])

        print(ob)
