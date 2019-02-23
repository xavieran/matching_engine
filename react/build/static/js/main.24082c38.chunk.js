(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{244:function(e,t,a){e.exports=a(492)},245:function(e,t,a){},459:function(e,t,a){},477:function(e,t,a){},492:function(e,t,a){"use strict";a.r(t);var n=a(18),r=a(19),l=a(23),o=a(22),s=a(24),i=a(230);var c=function(e,t){for(var a=0,n=0,r=0,l=0,o=0,s=0;s<t.length;s+=1){var i="BUY"==t[s].side?1:-1,c=t[s].volume*i,d=c*t[s].price;a+=c,i>0?(n+=c,l+=d):(r+=c,o+=d)}var u=l/n,h=o/r,m=-r;return{pnl:0==n&&0!=m?m*(h-e):0==m&&0!=n?n*(e-u):n>m?m*(h-u)+(n-m)*(e-u):n<m?n*(h-u)+(m-n)*(h-e):h*m-u*n,price:e,net_pos:a,tot_buy:n,tot_sell:r,avg_buy_px:u,avg_sell_px:h}},d=a(98),u=a.n(d);var h=function(){function e(t,a,r){Object(n.a)(this,e),this.onopen=t,this.onclose=a,this.notify=r,this.pnls={},this.orderbook={},this.orderbook_updates=[],this.trades={},this.all_trades=[],this.orders=[],this.hints=[],this.status="closed",this.websocket=null}return Object(r.a)(e,[{key:"render",value:function(){return null}},{key:"connect",value:function(e){var t=this;console.log("Opening connection to",e),this.websocket=new WebSocket(e),this.websocket.onopen=function(e){console.log("WebSocket onopen"),t.onopen(e)},this.websocket.onclose=function(e){console.log("WebSocket onclose"),t.onclose(e)},this.websocket.onerror=function(e){console.log("WebSocket error",e)},this.websocket.onmessage=function(e){console.log("WebSocket message",e);var a=JSON.parse(e.data);switch(a.type){case"orderbook":console.log("Got orderbook",a),t.handle_orderbook(a);break;case"trade":console.log("Got trade",a),t.handle_trade(a);break;case"order_ack":console.log("Got order",a),t.handle_order_ack(a);break;case"cancel_ack":console.log("Got cancel",a),t.handle_cancel_ack(a);break;case"hints":console.log("Got hints",a),t.handle_hints(a);break;case"sync_state":console.log("Got sync_state",a),t.handle_sync_state(a);break;case"status":console.log("Got exchange status",a),t.handle_status(a);break;default:console.error("Unsupported event",a)}t.update_pnl(),t.notify()}}},{key:"update_pnl",value:function(){console.log("START UPDATE",new Date);for(var e=this.orderbook_updates[this.orderbook_updates.length-1],t=.5*(e.ask+e.bid),a=Object.entries(this.trades),n=0;n<a.length;n++){var r=a[n],l=Object(i.a)(r,2),o=l[0],s=l[1];this.pnls[o]=c(t,s)}console.log("END UPDATE",new Date)}},{key:"handle_status",value:function(e){this.status=e.status}},{key:"handle_orderbook",value:function(e){this.orderbook=e,this.orderbook.ask=this.orderbook.ask.reverse(),this.handle_orderbook_update(this.orderbook)}},{key:"handle_orderbook_update",value:function(e){var t=null,a=null,n=u()(e.time);0!==e.bid.length&&(t=e.bid[0].price),0!==e.ask.length&&(a=e.ask[e.ask.length-1].price);var r={time:n,bid:t,ask:a};console.log("Updating orderbook history: ",r),this.orderbook_updates.push(r)}},{key:"handle_order_ack",value:function(e){this.orders.push(e)}},{key:"handle_cancel_ack",value:function(e){for(var t=0;t<this.orders.length;t++)if(this.orders[t].order_id===e.order_id){console.log("Removing order: ",this.orders[t]),this.orders.splice(t,1);break}}},{key:"handle_trade",value:function(e){if(this.all_trades.unshift(e),this.trades[e.trader_id]?this.trades[e.trader_id].unshift(e):this.trades[e.trader_id]=[e],e.trader_id==this.trader_id)for(var t=0;t<this.orders.length;t++)if(this.orders[t].order_id===e.order_id){this.orders[t].volume-=e.volume,this.orders[t].volume<=0&&(console.log("Removing order: ",this.orders[t]),this.orders.splice(t,1));break}}},{key:"handle_hints",value:function(e){console.log("Handling hints"),this.hints=e.hints}},{key:"handle_sync_state",value:function(e){console.log("Syncing state"),this.handle_hints(e),this.trades[e.trader_id]||""!=!e.trader_id||(this.trades[e.trader_id]=[]);for(var t=0;t<e.trades.length;t++)this.handle_trade(e.trades[t]);for(var a=0;a<e.orders.length;a++)this.handle_order_ack(e.orders[a]);for(var n=0;n<e.orderbooks.length;n++)this.handle_orderbook_update(e.orderbooks[n]);this.handle_orderbook(e.orderbook)}},{key:"send",value:function(e){this.websocket.send(JSON.stringify(e))}},{key:"send_order",value:function(e,t,a,n){var r={type:"insert",trader_id:n,order_id:"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}),side:e,price:t,volume:a};console.log("Sending order",r),this.send(r)}},{key:"send_login",value:function(e){var t={type:"login",trader_id:e};console.log("Logging in with: ",e),this.send(t)}},{key:"send_cancel",value:function(e,t){var a={type:"cancel",trader_id:t,order_id:e};console.log("Sending cancel",a),this.send(a)}},{key:"send_hint",value:function(e,t){var a={type:"hint",hint:e,trader_id:t};console.log("Sending hint",a),this.send(a)}}]),e}(),m=(a(245),a(247),a(210)),p=(a(360),a(0)),b=a.n(p),E=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e={datasets:[{label:"Bid",data:this.props.data.map(function(e){return{t:e.time,y:e.bid}}),steppedLine:"before",borderColor:"#00ff00",fill:!1},{label:"Ask",data:this.props.data.map(function(e){return{t:e.time,y:e.ask}}),steppedLine:"before",borderColor:"#ff0000",fill:!1}]};return console.log(e),b.a.createElement("div",{className:"orderbookGraph"},b.a.createElement(m.a,{height:300,data:e,options:{responsive:!0,maintainAspectRatio:!1,scales:{yAxes:[{distribution:"linear",ticks:{beginAtZero:!0,suggestedMin:0}}],xAxes:[{type:"time",distribution:"linear",ticks:{source:"data"}}]},pan:{enabled:!1,mode:"x",speed:10,threshold:10},zoom:{enabled:!0,mode:"x",sensitivity:.25}}}))}}]),t}(b.a.Component),f=(a(362),a(105)),_=a.n(f),v=(a(363),a(209)),k=a(505),g=a(512),y=a(208),O=a(511),j=a(212),x=a(219),C=a.n(x),S=a(107),w=a.n(S),N=a(106),T=a.n(N),A=a(41),B=a.n(A),I=a(36),L=a.n(I),z=a(137),H=a.n(z),U=a(62),D=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={volume:1,price:1},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return b.a.createElement("div",{className:"quoteInput"},b.a.createElement("button",{className:this.props.side+"Button",onClick:function(){return e.props.trade(e.props.side.toUpperCase(),e.state.price,e.state.volume)}},this.props.side),b.a.createElement(_.a,{className:"volumeInput",min:1,max:1e3,step:1,precision:0,value:this.state.volume,size:6,mobile:!0,onChange:function(t,a,n){return e.setState({volume:t})}}),b.a.createElement("b",null,"@ $"),b.a.createElement(_.a,{className:"priceInput",min:1,max:1e5,step:1,precision:0,value:this.state.price,size:6,mobile:!0,onChange:function(t,a,n){return e.setState({price:t})}}))}}]),t}(b.a.Component),G=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return b.a.createElement("div",{className:"hitLimitInput"},b.a.createElement(y.a,{pointing:"right",size:"medium",color:"black"},"Hit Limit"),b.a.createElement(_.a,{className:"volumeInput",min:1,max:1e5,step:1,precision:0,value:this.props.volume,size:6,mobile:!0,onChange:function(t,a,n){return e.props.onChange(t)}}))}}]),t}(b.a.Component),P=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return b.a.createElement("div",null,b.a.createElement(D,{side:"sell",trade:this.props.place_quote}),b.a.createElement(D,{side:"buy",trade:this.props.place_quote}),b.a.createElement(G,{volume:this.props.hit_limit,onChange:function(t){return e.props.hit_limit_change(t)}}))}}]),t}(b.a.Component),W=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this.props.pnl;if(!e)return b.a.createElement("div",null);var t=new Intl.NumberFormat("en-US",{style:"currency",currencyDisplay:"symbol",currency:"USD"}).format;return b.a.createElement("tr",null,b.a.createElement("td",null,b.a.createElement("b",null,this.props.trader_id)),b.a.createElement("td",null,b.a.createElement("b",null,t(e.pnl))),b.a.createElement("td",null,b.a.createElement("b",null,t(e.price))),b.a.createElement("td",null,b.a.createElement("b",null,e.net_pos)),b.a.createElement("td",null,b.a.createElement("b",null,t(e.avg_buy_px))),b.a.createElement("td",null,b.a.createElement("b",null,e.tot_buy)),b.a.createElement("td",null,b.a.createElement("b",null,t(e.avg_sell_px))),b.a.createElement("td",null,b.a.createElement("b",null,e.tot_sell)))}}]),t}(b.a.Component),F=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=null;return this.props.pnls&&(e=Object.entries(this.props.pnls).map(function(e){return b.a.createElement(W,{key:e[0],trader_id:e[0],pnl:e[1]})})),b.a.createElement("div",{className:"pnlDisplay"},b.a.createElement(H.a,{bordered:!0},b.a.createElement("thead",null,b.a.createElement("tr",null,b.a.createElement("td",null,b.a.createElement("b",null,"Trader")),b.a.createElement("td",null,b.a.createElement("b",null,"PnL")),b.a.createElement("td",null,b.a.createElement("b",null,"Market")),b.a.createElement("td",null,b.a.createElement("b",null,"Net Pos")),b.a.createElement("td",null,b.a.createElement("b",null,"Avg Buy")),b.a.createElement("td",null,b.a.createElement("b",null,"Tot Buy")),b.a.createElement("td",null,b.a.createElement("b",null,"Avg Sell")),b.a.createElement("td",null,b.a.createElement("b",null,"Tot Sell")))),b.a.createElement("tbody",null,e)))}}]),t}(b.a.Component),M=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t=this.props.orders.sort(function(e,t){return e.price<t.price}).map(function(t){return b.a.createElement("tr",{key:t.order_id},b.a.createElement("td",null,b.a.createElement("button",{className:"cancelButton",onClick:function(){return e.props.cancel(t.order_id)}},b.a.createElement(v.a,{name:"close",color:"red"}))),b.a.createElement("td",null,t.side),b.a.createElement("td",null,"$",t.price),b.a.createElement("td",null,t.volume))});return b.a.createElement("div",{className:"orderList"},b.a.createElement(g.a,{as:"h3"},"Active Orders"),b.a.createElement(H.a,{bordered:!0,striped:!0,hover:!0},b.a.createElement("thead",null,b.a.createElement("tr",null,b.a.createElement("td",null,b.a.createElement("b",null)),b.a.createElement("td",null,b.a.createElement("b",null,"Side")),b.a.createElement("td",null,b.a.createElement("b",null,"Price")),b.a.createElement("td",null,b.a.createElement("b",null,"Volume")))),b.a.createElement("tbody",null,t)))}}]),t}(b.a.Component),R=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return b.a.createElement("div",{className:"tradeList"},b.a.createElement(O.a,null,b.a.createElement(g.a,{as:"h3"},"Trades"),b.a.createElement(U.BootstrapTable,{data:this.props.trades,trClassName:function(e,t){return"BUY"==e.side?"tableRowBuy":"table-row-sell"},exportCSV:!0,height:"400"},b.a.createElement(U.TableHeaderColumn,{isKey:!0,hidden:!0,dataField:"trade_id"},"trade_id"),b.a.createElement(U.TableHeaderColumn,{width:"6em",dataField:"side"},"Side"),b.a.createElement(U.TableHeaderColumn,{width:"6em",dataField:"price",dataFormat:function(e){return"$"+e}},"Price"),b.a.createElement(U.TableHeaderColumn,{width:"6em",dataField:"volume"},"Volume"),b.a.createElement(U.TableHeaderColumn,{dataField:"counterpart_id"},"With"))))}}]),t}(b.a.Component),$=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return b.a.createElement("div",null,this.props.volume)}}]),t}(b.a.Component),q=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t=null,a=null;return null==this.props.orderbook.ask||(t=this.props.orderbook.ask.map(function(t){return b.a.createElement("tr",{key:t.price},b.a.createElement("td",null,e.props.tradable?b.a.createElement("button",{className:"hitButton buyButton",onClick:function(){return e.props.hit_trade("BUY",t.price)}},e.props.hit_limit):b.a.createElement("div",null)),b.a.createElement("td",{className:"bold"},"$",t.price),b.a.createElement("td",null,b.a.createElement($,{volume:t.volume})))})),null==this.props.orderbook.bid||(a=this.props.orderbook.bid.map(function(t){return b.a.createElement("tr",{key:t.price},b.a.createElement("td",null,t.volume),b.a.createElement("td",{className:"bold"},"$",t.price),b.a.createElement("td",null,e.props.tradable?b.a.createElement("button",{className:"hitButton sellButton",onClick:function(){return e.props.hit_trade("SELL",t.price)}},e.props.hit_limit):b.a.createElement("div",null)))})),b.a.createElement("div",null,b.a.createElement("table",{className:"orderbookTable"},b.a.createElement("thead",null,b.a.createElement("tr",null,b.a.createElement("td",{className:"bidHeader"},"Bid"),b.a.createElement("td",{className:"priceHeader"},"Price"),b.a.createElement("td",{className:"askHeader"},"Ask"))),b.a.createElement("tbody",null,t,a)))}}]),t}(b.a.Component),J=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return b.a.createElement(T.a,null,b.a.createElement(T.a.Group,{controlId:"formHint"},b.a.createElement(T.a.Control,{as:"textarea",rows:"2",size:"lg",type:"text",placeholder:"Enter hint",ref:function(t){return e.hint=t}}),b.a.createElement(C.a,{size:"lg",variant:"primary",onClick:function(){e.hint.value&&e.props.send_hint(e.hint.value),e.hint.value=null}},"Send Hint")))}}]),t}(b.a.Component),V=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={active:!1},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t=b.a.createElement("b",null,"No hints");this.props.hints.length>0&&(t=this.props.hints[0]);var a=null;return this.props.hints.length>1&&(a=this.props.hints.slice(1).map(function(e){return b.a.createElement("div",{key:e},e)})),b.a.createElement(O.a,null,b.a.createElement(k.a,null,b.a.createElement(k.a.Title,{active:this.state.active,index:0,as:g.a,onClick:function(){return e.setState({active:!e.state.active})}},b.a.createElement(v.a,{name:"dropdown"}),t),b.a.createElement(k.a.Content,{active:!this.state.active},a)))}}]),t}(b.a.Component),Y=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={value:0},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t={start:0,min:0,max:this.props.data.length,step:5,onChange:function(t){return e.setState({value:t})}};return b.a.createElement("div",null,b.a.createElement(E,{data:this.props.data.slice(this.state.value),trade:[]}),b.a.createElement(y.a,{pointing:"below"},this.state.value),b.a.createElement(j.Slider,{discrete:!0,color:"red",settings:t}))}}]),t}(b.a.Component),K=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={hit_limit:1},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t={};t[this.props.trader_id]=this.props.pnls[this.props.trader_id];var a=this.props.trades[this.props.trader_id];return b.a.createElement(w.a,{style:{"max-width":"3440px"}},b.a.createElement(B.a,null,b.a.createElement(L.a,null,b.a.createElement(V,{hints:this.props.hints}),b.a.createElement(O.a,null,b.a.createElement(Y,{data:this.props.orderbook_updates,trade:[]})))),b.a.createElement(B.a,{className:"smallMargins"},b.a.createElement(L.a,{md:"auto"},b.a.createElement(O.a,null,b.a.createElement(B.a,null,b.a.createElement(P,{place_quote:this.props.trade,hit_limit_change:function(t){return e.setState({hit_limit:t})},hit_limit:this.state.hit_limit})),b.a.createElement("hr",null),b.a.createElement(B.a,{style:{justifyContent:"center"}},b.a.createElement(q,{orderbook:this.props.orderbook,hit_limit:this.state.hit_limit,tradable:!0,hit_trade:function(t,a){return e.props.trade(t,a,e.state.hit_limit)}})))),b.a.createElement(L.a,null,b.a.createElement(O.a,null,b.a.createElement(F,{pnls:t}),b.a.createElement(M,{orders:this.props.orders,cancel:this.props.cancel}))),b.a.createElement(L.a,null,b.a.createElement(R,{trades:a}))))}}]),t}(b.a.Component),Z=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return b.a.createElement(w.a,{style:{"max-width":"3440px"}},b.a.createElement(B.a,null,b.a.createElement(L.a,null,b.a.createElement(O.a,null,b.a.createElement(V,{hints:this.props.hints}),b.a.createElement(Y,{data:this.props.orderbook_updates,trade:[]})))),b.a.createElement(B.a,null,b.a.createElement(L.a,null,b.a.createElement(O.a,null,b.a.createElement(B.a,{style:{justifyContent:"center"}},b.a.createElement(q,{orderbook:this.props.orderbook,tradable:!1})))),b.a.createElement(L.a,null,b.a.createElement(O.a,null,b.a.createElement(F,{pnls:this.props.pnls}))),b.a.createElement(L.a,null,b.a.createElement(R,{trades:this.props.trades}))))}}]),t}(b.a.Component),Q=function(e){function t(){return Object(n.a)(this,t),Object(l.a)(this,Object(o.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return b.a.createElement(w.a,{style:{"max-width":"3440px"}},b.a.createElement(B.a,null,b.a.createElement(L.a,null,b.a.createElement(O.a,null,b.a.createElement(V,{hints:this.props.hints}),b.a.createElement(Y,{data:this.props.orderbook_updates,trade:[]})))),b.a.createElement(B.a,null,b.a.createElement(L.a,null,b.a.createElement(J,{send_hint:function(t){return e.props.hint(t)}}),b.a.createElement(O.a,null,b.a.createElement(B.a,{style:{justifyContent:"center"}},b.a.createElement(q,{orderbook:this.props.orderbook,tradable:!1})))),b.a.createElement(L.a,null,b.a.createElement(R,{trades:this.props.trades}))))}}]),t}(b.a.Component),X=(a(459),a(509)),ee=a(504),te=a(508),ae=a(515),ne=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={trader_id:""},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;return console.log("id",this.props.trader_id),null==this.props.trader_id?b.a.createElement(X.a,{textAlign:"center",style:{height:"100%"},verticalAlign:"middle"},b.a.createElement(X.a.Column,{style:{maxWidth:450}},b.a.createElement(g.a,{as:"h2",color:"blue",textAlign:"center"},"Login to exchange"),b.a.createElement(ee.a,{size:"large"},b.a.createElement(O.a,null,b.a.createElement(ee.a.Input,{fluid:!0,icon:"user",iconPosition:"left",placeholder:"Enter login",onChange:function(t){return e.setState({trader_id:t.target.value})}}),b.a.createElement(te.a,{color:"blue",fluid:!0,size:"large",onClick:function(){e.state.trader_id&&e.props.login(e.state.trader_id)}},"Login"))))):b.a.createElement(ae.a,{push:!0,to:this.props.redirect})}}]),t}(b.a.Component),re=(a(477),a(507)),le=a(514),oe=a(510),se=a(503),ie=a(513),ce=a(32),de=a.n(ce),ue=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(l.a)(this,Object(o.a)(t).call(this,e))).state={exchange_host:"ws://le-chateaud:6789/",status:"closed",trader_id:null,connected:null,orderbook:{bid:[],ask:[]},orderbook_updates:[],orders:[],trades:{},all_trades:[],pnls:{},hints:["Depth of all the world's oceans in meters","There are 7 oceans"]},a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){console.log("Mounted"),this.exchange_interface=new h(this.onopen.bind(this),this.onclose.bind(this),this.exchange_event.bind(this)),this.exchange_interface.connect(this.state.exchange_host)}},{key:"componentWillUnmount",value:function(){delete this.exchange_interface}},{key:"exchange_event",value:function(){console.log("Updating state",this.exchange_interface),this.setState({exchange_host:this.exchange_host,status:this.exchange_interface.status,orderbook:this.exchange_interface.orderbook,trades:this.exchange_interface.trades,all_trades:this.exchange_interface.all_trades,orders:this.exchange_interface.orders,hints:this.exchange_interface.hints,orderbook_updates:this.exchange_interface.orderbook_updates,pnls:this.exchange_interface.pnls})}},{key:"onopen",value:function(e){console.log("Received onopen",e),this.setState({connected:!0}),this.exchange_interface.send_login("")}},{key:"onclose",value:function(e){console.log("Received onclose",e),this.setState({connected:!1})}},{key:"connect",value:function(){console.log("About to connect"),this.exchange_interface.connect()}},{key:"send_order",value:function(e,t,a){this.exchange_interface.send_order(e,t,a,this.state.trader_id)}},{key:"send_cancel",value:function(e){this.exchange_interface.send_cancel(e,this.state.trader_id)}},{key:"send_hint",value:function(e){this.exchange_interface.send_hint(e,"")}},{key:"login",value:function(e){console.log("Logging in as: ",e),this.exchange_interface.send_login(e),this.setState({trader_id:e})}},{key:"render",value:function(){var e=this;return b.a.createElement(oe.a,null,b.a.createElement("div",null,b.a.createElement(re.a,{stackable:!0},b.a.createElement(re.a.Item,{name:this.state.trader_id?"Logout":"Login",href:"/login"},b.a.createElement(v.a,{name:"user",color:"blue",size:"large"})),b.a.createElement(re.a.Item,{name:"Monitor",as:se.a,to:"/monitor"},b.a.createElement(v.a,{name:"chart line",color:"blue",size:"large"})),b.a.createElement(re.a.Item,{name:"Admin",as:se.a,to:"/admin"},b.a.createElement(v.a,{name:"spy",color:"black",size:"large"})),b.a.createElement(re.a.Item,{name:"Status",position:"right",size:"large"},this.state.status),b.a.createElement(re.a.Item,{name:"Connected",position:"right"},this.state.trader_id?b.a.createElement("b",null,"Trader:"+this.state.trader_id+" "):null,b.a.createElement(le.a,{trigger:b.a.createElement(v.a,{name:"exchange",color:this.state.connected?"green":"red",size:"large"}),content:this.state.connected?"Connected to exchange":"Not connected!"}))),b.a.createElement(ie.a,{exact:!0,path:"/",render:function(e){return b.a.createElement(ae.a,{push:!0,to:"/login"})}}),b.a.createElement(ie.a,{exact:!0,path:"/login",render:function(t){return b.a.createElement(ne,{login:e.login.bind(e),connected:e.state.connected,trader_id:e.state.trader_id,redirect:"/TraderInterface"})}}),b.a.createElement(ie.a,{exact:!0,path:"/TraderInterface",render:function(t){return null==e.state.trader_id?b.a.createElement(ae.a,{push:!0,to:"/"}):b.a.createElement(K,{trade:e.send_order.bind(e),trader_id:e.state.trader_id,cancel:e.send_cancel.bind(e),orderbook:e.state.orderbook,orderbook_updates:e.state.orderbook_updates,orders:e.state.orders,trades:e.state.trades,pnls:e.state.pnls,hints:e.state.hints})}}),b.a.createElement(ie.a,{exact:!0,path:"/monitor",render:function(t){return b.a.createElement(Z,{orderbook:e.state.orderbook,orderbook_updates:e.state.orderbook_updates,hints:e.state.hints,pnls:e.state.pnls,trades:e.state.all_trades})}}),b.a.createElement(ie.a,{exact:!0,path:"/admin",render:function(t){return b.a.createElement(Q,{hint:e.send_hint.bind(e),orderbook:e.state.orderbook,orderbook_updates:e.state.orderbook_updates,hints:e.state.hints,trades:e.state.trades})}})))}}]),t}(b.a.Component),he=b.a.createElement(ue,null);de.a.render(he,document.getElementById("root"))}},[[244,2,1]]]);
//# sourceMappingURL=main.24082c38.chunk.js.map