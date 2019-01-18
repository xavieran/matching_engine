#!/usr/bin/env python

import orderbook.orderbook as orderbook

import unittest

class LevelsTest(unittest.TestCase):
    def test_init(self):
        bid_levels = orderbook.Levels(orderbook.BUY)

        aggressing_sell = 20
        quote_bid = 30
        self.assertEqual(bid_levels.comp(aggressing_sell, quote_bid), True)
        aggressing_sell = 40
        self.assertEqual(bid_levels.comp(aggressing_sell, quote_bid), False)

        ask_levels = orderbook.Levels(orderbook.SELL)

        aggressing_buy = 40 
        quote_ask = 30
        self.assertEqual(ask_levels.comp(aggressing_buy, quote_ask), True)
        aggressing_buy = 20 
        self.assertEqual(ask_levels.comp(aggressing_buy, quote_ask), False)

    def test_add_level(self):
        print("Test Add Level")

        ask_levels = orderbook.Levels(orderbook.SELL)

        ask_levels.add_level(13)
        self.assertEqual(ask_levels.prices, [13])
        self.assertEqual(len(ask_levels.levels), 1)

        ask_levels.add_level(12)
        self.assertEqual(ask_levels.prices, [12, 13])
        self.assertEqual(len(ask_levels.levels), 2)

        ask_levels.add_level(14)
        self.assertEqual(ask_levels.prices, [12, 13, 14])
        self.assertEqual(len(ask_levels.levels), 3)

        self.assertRaises(AssertionError, lambda: ask_levels.add_level(12))

        print(ask_levels)

        bid_levels = orderbook.Levels(orderbook.BUY)

        bid_levels.add_level(10)
        self.assertEqual(bid_levels.prices, [10])
        self.assertEqual(len(bid_levels.levels), 1)

        bid_levels.add_level(11)
        self.assertEqual(bid_levels.prices, [11, 10])
        self.assertEqual(len(bid_levels.levels), 2)

        bid_levels.add_level(9)
        self.assertEqual(bid_levels.prices, [11, 10, 9])
        self.assertEqual(len(bid_levels.levels), 3)

        self.assertRaises(AssertionError, lambda: bid_levels.add_level(9))

        print(bid_levels)

    def test_remove_level(self):
        print("Test Remove Level")
        bid_levels = orderbook.Levels(orderbook.BUY)

        bid_levels.add_level(10)
        bid_levels.add_level(11)
        bid_levels.add_level(9)
        self.assertEqual(bid_levels.prices, [11, 10, 9])
        self.assertEqual(len(bid_levels.levels), 3)

        print(bid_levels)

        bid_levels.remove_level(10)
        self.assertEqual(bid_levels.prices, [11, 9])
        self.assertEqual(len(bid_levels.levels), 2)

        print(bid_levels)

    def test_insert(self):
        print("Test Insert")
        bid_levels = orderbook.Levels(orderbook.BUY)
        
        bid_levels.insert(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))

        self.assertEqual(bid_levels.prices, [10])
        self.assertEqual(len(bid_levels.levels), 1)

        print(bid_levels)

        bid_levels.insert(orderbook.Order("trader1", 1, orderbook.BUY, 10, 7))
        self.assertEqual(bid_levels.prices, [10])
        self.assertEqual(len(bid_levels.levels), 1)

        print(bid_levels)

        ask_levels = orderbook.Levels(orderbook.SELL)
        
        ask_levels.insert(orderbook.Order("trader1", 0, orderbook.SELL, 10, 5))

        self.assertEqual(ask_levels.prices, [10])
        self.assertEqual(len(ask_levels.levels), 1)

        print(ask_levels)

        ask_levels.insert(orderbook.Order("trader1", 1, orderbook.SELL, 10, 7))
        self.assertEqual(ask_levels.prices, [10])
        self.assertEqual(len(ask_levels.levels), 1)

        print(ask_levels)

    def test_cancel(self):
        print("Test Cancel")
        bid_levels = orderbook.Levels(orderbook.BUY)
        self.assertEqual(bid_levels.cancel(4), False)

        bid_levels.insert(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))

        self.assertEqual(bid_levels.prices, [10])
        self.assertEqual(len(bid_levels.levels), 1)

        print(bid_levels)

        self.assertEqual(bid_levels.cancel(0), True)
        self.assertEqual(bid_levels.prices, [])
        self.assertEqual(bid_levels.levels, {})
        self.assertEqual(len(bid_levels.levels), 0)

        print(bid_levels)

        bid_levels.insert(orderbook.Order("trader1", 1, orderbook.BUY, 10, 5))
        bid_levels.insert(orderbook.Order("trader1", 2, orderbook.BUY, 12, 7))
        bid_levels.insert(orderbook.Order("trader1", 3, orderbook.BUY, 13, 10))

        self.assertEqual(bid_levels.prices, [13, 12, 10])
        self.assertEqual(len(bid_levels.levels), 3)

        print(bid_levels)

        self.assertEqual(bid_levels.cancel(2), True)
        self.assertEqual(bid_levels.prices, [13, 10])
        self.assertEqual(len(bid_levels.levels), 2)

        print(bid_levels)

    def test_match(self):
        print("Test Match")
        bid_levels = orderbook.Levels(orderbook.BUY)

        bid_levels.insert(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))
        bid_levels.insert(orderbook.Order("trader1", 1, orderbook.BUY, 10, 3))
        bid_levels.insert(orderbook.Order("trader1", 2, orderbook.BUY, 12, 7))
        bid_levels.insert(orderbook.Order("trader1", 3, orderbook.BUY, 13, 10))

        self.assertEqual(bid_levels.prices, [13, 12, 10])
        self.assertEqual(len(bid_levels.levels), 3)

        print(bid_levels)

        aggressing_order = orderbook.Order("trader1", 5, orderbook.SELL, 14, 1)

        trades = bid_levels.match(aggressing_order)
        self.assertEqual(trades, [])

        aggressing_order = orderbook.Order("trader1", 5, orderbook.SELL, 13, 1)
        trades = bid_levels.match(aggressing_order)

        self.assertEqual(len(trades), 1)
        self.assertEqual(bid_levels.prices, [13, 12, 10])
        self.assertEqual(len(bid_levels.levels), 3)

        print(", ".join(map(str, trades)))

        aggressing_order = orderbook.Order("trader1", 5, orderbook.SELL, 12, 1)
        trades = bid_levels.match(aggressing_order)

        self.assertEqual(trades[0].price, 13)

        print(", ".join(map(str, trades)))

        aggressing_order = orderbook.Order("trader1", 5, orderbook.SELL, 12, 10)
        trades = bid_levels.match(aggressing_order)

        self.assertEqual(len(trades), 2)
        self.assertEqual(bid_levels.prices, [12, 10])
        self.assertEqual(trades[0].price, 13)
        self.assertEqual(trades[1].price, 12)

        print(bid_levels)
        print(", ".join(map(str, trades)))

