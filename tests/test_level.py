#!/usr/bin/env python

import orderbook

import unittest

class LevelTest(unittest.TestCase):
    def test_insert(self):
        print("Test Insert")
        level = orderbook.Level(10, orderbook.BUY)
        order = orderbook.Order("trader1", 0, orderbook.BUY, 10, 5)

        level.insert(order)

        self.assertEqual(level.volume, 5)
        self.assertEqual(len(level.level), 1)
        
        print(level)

        order = orderbook.Order("trader1", 3, orderbook.BUY, 10, 10)
        level.insert(order)

        self.assertEqual(level.volume, 15)
        self.assertEqual(len(level.level), 2)

        print(level)

        bad_order = orderbook.Order("trader1", 3, orderbook.SELL, 10, 10)
        self.assertRaises(AssertionError, lambda : level.insert(bad_order))
        
        bad_order = orderbook.Order("trader1", 3, orderbook.BUY, 9, 10)
        self.assertRaises(AssertionError, lambda : level.insert(bad_order))
        
    def set_level(self):
            level = orderbook.Level(10, orderbook.BUY)
            level.insert(orderbook.Order("trader1", 0, orderbook.BUY, 10, 5))
            level.insert(orderbook.Order("trader1", 1, orderbook.BUY, 10, 10))
            level.insert(orderbook.Order("trader1", 2, orderbook.BUY, 10, 12))
            return level
        
    def test_match(self):
        level = self.set_level()
        self.assertEqual(level.volume, 27)
        self.assertEqual(len(level.level), 3)
        print("Test Match")
        print(level)
        
        trades, matched = level.match(2)
        print(",".join(map(str, trades)))
        print(level)
        
        self.assertEqual(matched, 2) 
        self.assertEqual(len(trades), 1)
        self.assertEqual(level.volume, 25)
        self.assertEqual(len(level.level), 3)
        
        trades, matched = level.match(3)
        
        print(",".join(map(str, trades)))
        print(level)
        
        self.assertEqual(matched, 3) 
        self.assertEqual(len(trades), 1)
        self.assertEqual(level.volume, 22)
        self.assertEqual(len(level.level), 2)
        
        trades, matched = level.match(12)
        
        print(",".join(map(str, trades)))
        print(level)
        
        self.assertEqual(matched, 12) 
        self.assertEqual(len(trades), 2)
        self.assertEqual(level.volume, 10)
        self.assertEqual(len(level.level), 1)
        
        # TODO: Orders that take out the whole level should be left in
        trades, matched = level.match(15)
        
        print(",".join(map(str, trades)))
        print(level)
        
        #self.assertEqual(len(trades), 1)
        #self.assertEqual(level.volume, 5)
        #self.assertEqual(len(level.level), 1)
        
    def test_cancel(self):
        print("Test Cancel")
        level = self.set_level()
        
        self.assertEqual(level.volume, 27)
        self.assertEqual(len(level.level), 3)
        
        self.assertEqual(level.cancel(0), True)
        self.assertEqual(level.volume, 22)
        self.assertEqual(len(level.level), 2)
        
        level = self.set_level()
        
        self.assertEqual(level.volume, 27)
        self.assertEqual(len(level.level), 3)
       
        self.assertEqual(level.cancel(1), True)
        self.assertEqual(level.volume, 17)
        self.assertEqual(len(level.level), 2)
       
        level = self.set_level()
        
        self.assertEqual(level.volume, 27)
        self.assertEqual(len(level.level), 3)
       
        
        self.assertEqual(level.cancel(2), True)
        self.assertEqual(level.volume, 15)
        self.assertEqual(len(level.level), 2)
    
        self.assertEqual(level.cancel(1), True)
        self.assertEqual(level.volume, 5)
        self.assertEqual(len(level.level), 1)
        
        self.assertEqual(level.cancel(1), False)
        self.assertEqual(level.volume, 5)
        self.assertEqual(len(level.level), 1)
        

