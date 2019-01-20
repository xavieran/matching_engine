var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
    var websocket = new WebSocket("ws://le-chateaud:6789/");
    $scope.connected = false;
    $scope.ready_to_trade = false;
    $scope.input_trader_id = "";
    $scope.trader_id = "";
    $scope.side = true;
    $scope.price = 1; 
    $scope.volume = 1; 
    $scope.order_id = 0;

    $scope.net_position = 0;
    $scope.pnl = 0;
	$scope.avg_buy_px = 0;
	$scope.avg_sell_px = 0;
	$scope.tot_buy_vol= 0;
	$scope.tot_ask_vol= 0;

    $scope.top_bids = []
    $scope.top_asks = []
    $scope.trade_prices = []
    $scope.orderbook = {"bid":[], "ask":[]};
	$scope.orders = [];
	$scope.trades = [];

    $scope.readyToTrade = () => {
        console.log("Setting trader_id to: " + $scope.input_trader_id);
        console.log($scope.input_trader_id);
        $scope.trader_id = ' ' + $scope.input_trader_id;
        $scope.ready_to_trade = true;
        websocket.send(JSON.stringify({type: "sync_state", trader_id: $scope.trader_id}));
    }

	$scope.display_order = (order) => {
		return order.side + " "  + order.volume + " @$" + order.price;
	}

	$scope.trade = (side, price, volume) => {
        let order = {
            "type":"insert", 
            "trader_id": $scope.trader_id,
            "order_id":uuidv4(),
            "side": side,
            "price": price,
            "volume": volume}

        $scope.orders.push(order)
        websocket.send(JSON.stringify(order))

		console.log($scope.orders);
	};

    $scope.cancel = (order_id) => {
		let cancel = {
			"type":"cancel",
			"trader_id": $scope.trader_id,
			"order_id": order_id}
        $scope.orders = $scope.orders.filter(
            (elem) => {return elem.order_id != order_id;});
		websocket.send(JSON.stringify(cancel));
		
		console.log("Cancelled " + order_id)
	};

	$(window).on('beforeunload', function(){
		websocket.close();
	});


    websocket.onopen= function (event) {
        console.log("Opened connection");
        $scope.connected = true;
        $scope.$apply();
    }

    websocket.onclose = function (event) {
        $scope.connected = false;
        $scope.$apply();
        console.log("Connection closed");
    }
     
    websocket.onerror = function (event) {
        console.log("Failed to connect");
    }
        
    websocket.onmessage = function (event) {
        data = JSON.parse(event.data);

        switch (data.type) {
            case 'orderbook':
                let bid = null;
                let ask = null;
				time = moment(data.time);
				if (data.bid.length != 0){
                    bid = data.bid[0].price
                }

                if (data.ask.length != 0){
                    ask = data.ask[0].price
                }

                $scope.top_bids.push({
					't': time,
					'y': bid});

                $scope.top_asks.push({
                    't': time,
                    'y': ask});

				console.log(time)

				console.log($scope.top_asks)
				console.log($scope.top_bids)

                $scope.orderbook.bid = data.bid;
                $scope.orderbook.ask = data.ask.reverse();
                console.log("received orderbook update");
                $scope.orderbook_chart.update();
				$scope.$apply();
                break;
			case 'trade':
                console.log("received trade" + data.trader_id)
				if (data.trader_id == $scope.trader_id)
				{
					if (data.side == "BUY"){
						data.signed_volume = data.volume;
					}
					if (data.side == "SELL"){
						data.signed_volume = -1 * data.volume;
					}
					$scope.trades.unshift(data);
					update_pnl($scope.trades);
                    $scope.trade_prices.push({'t':moment(data.time), 'y':data.price});
					let index = findWithAttr($scope.orders, "order_id", data.order_id);
					if (index != -1){
						$scope.orders[index].volume -= data.volume;
						if ($scope.orders[index].volume <= 0){
							$scope.orders = $scope.orders.filter(
								(elem) => {return elem.order_id != data.order_id;});
						}
					}
					$scope.$apply();
				}
				break;
            case 'order':
                console.log("received order" + data.trader_id)
                if (data.trader_id == $scope.trader_id)
				{
					$scope.orders.push(data)
					$scope.$apply();
				}
				break;

            default:
                console.error(
                    "unsupported event", data);
        }

    };

	function update_pnl(trades){
		net_pos = 0;
		tot_buy = 0;
		tot_buy_val = 0;
		tot_sell = 0;
		tot_sell_val = 0;
		for (var i = 0; i < trades.length; i += 1)
		{
			vol = trades[i].signed_volume
			px = trades[i].price
			val = vol * px
			net_pos += vol
			if (vol > 0){
				tot_buy += vol;
				tot_buy_val += val;
			}
			if (vol < 0){
				tot_sell += vol;
				tot_sell_val += val;
			}
		}
		console.log(tot_buy_val);
		console.log(tot_sell_val);
		avg_buy_px = tot_buy_val / tot_buy;
		avg_sell_px = tot_sell_val / tot_sell;

		$scope.net_position = net_pos;
		$scope.pnl = avg_sell_px * (-1 * tot_sell) - avg_buy_px * tot_buy 
		$scope.avg_buy_px = avg_buy_px;
		$scope.avg_sell_px = avg_sell_px;
		$scope.tot_buy_vol = tot_buy;
		$scope.tot_sell_vol = tot_sell;
	}

	function findWithAttr(array, attr, value) {
		for(var i = 0; i < array.length; i += 1) {
			if(array[i][attr] === value) {
				return i;
			}
		}
		return -1;
	}

    function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}

	var ctx = document.getElementById("orderbook_chart").getContext('2d');
	$scope.orderbook_chart = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [
				{
                    label: 'Bid',
                    data: $scope.top_bids,
                    steppedLine: 'before',
                    borderColor: "#00ff00"
                },
				{
                    label: 'Ask', 
                    data: $scope.top_asks,
                    steppedLine: 'before',
                    borderColor: "#ff0000",
                },
                {
                    label: 'Trades', 
                    data: $scope.trade_prices,
                    steppedLine: 'before',
                    showLine: false,
                    borderColor: "#ff00ff",
                    pointStyle: "dot",
                    pointRadius: 6,
                    fill: true
                }
			]
		},
		options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: "Orderbook and Trades"
            },
			scales: {
				yAxes: [{
                    distribution: 'linear',
					ticks: {
						beginAtZero:false
					}
				}],
				xAxes: [{
					type: 'time',
					distribution: 'linear',
					ticks: {
						source: 'data'
					}
				}]

			},
            pan: {
                enabled: true,
                mode: 'x',
                speed: 10,
                threshold: 10,
                onPan: function() {console.log("PANNED");}
            },
            zoom: {
                enabled: true,
                mode: 'x',
                sensitivity: 0.25
            }
		}
	});
});

