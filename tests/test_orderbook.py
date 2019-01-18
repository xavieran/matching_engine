#!/usr/bin/env python

import orderbook

import unittest

class OrderBookTest(unittest.TestCase):
    def test_insert_order(self):
        "Test Orderbook Insert Order"
        saved_trades = []
        def trade_handler(trades):
            saved_trades.extend(trades)

        ob = orderbook.OrderBook(trade_handler)
        
        ob.insert_order(orderbook.Order(0, orderbook.BUY, 10, 5))
        ob.insert_order(orderbook.Order(1, orderbook.BUY, 10, 3))
        self.assertEqual(ob.bid_levels.prices, [10])
        self.assertEqual(saved_trades, [])

        ob.insert_order(orderbook.Order(2, orderbook.SELL, 11, 7))
        ob.insert_order(orderbook.Order(3, orderbook.SELL, 12, 4))

        self.assertEqual(ob.ask_levels.prices, [11, 12])
        self.assertEqual(saved_trades, [])

        print(ob)

        ob.insert_order(orderbook.Order(4, orderbook.SELL, 10, 10))

        self.assertEqual(ob.bid_levels.prices, []) 
        self.assertEqual(len(saved_trades), 2) 
        print(ob)

    def test_cancel_order(self):
        "Test Orderbook Insert Order"
        ob = orderbook.OrderBook()
        
        ob.insert_order(orderbook.Order(0, orderbook.BUY, 10, 5))
        ob.insert_order(orderbook.Order(1, orderbook.BUY, 10, 3))
        self.assertEqual(ob.bid_levels.prices, [10])
        self.assertEqual(saved_trades, [])

        ob.insert_order(orderbook.Order(2, orderbook.SELL, 11, 7))
        ob.insert_order(orderbook.Order(3, orderbook.SELL, 12, 4))

        self.assertEqual(ob.ask_levels.prices, [11, 12])
        self.assertEqual(saved_trades, [])

        print(ob)

        ob.insert_order(orderbook.Order(4, orderbook.SELL, 10, 10))

        self.assertEqual(ob.bid_levels.prices, []) 
        self.assertEqual(len(saved_trades), 2) 
        print(ob)

