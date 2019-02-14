function calculate_pnl(price, trades){
    let pnl = 0
    let net_pos = 0
    let tot_buy = 0
    let tot_sell = 0
    let tot_buy_val = 0
    let tot_sell_val = 0

    for (let i = 0; i < trades.length; i += 1){
        const sign = trades.side == 'BUY' ? 1 : -1
        const vol = trades[i].volume * sign
        const px = trades[i].price
        const val = vol * px
        net_pos += vol

        if (sign > 0){
            tot_buy += vol
            tot_buy_val += val
        } else {
            tot_sell += vol
            tot_sell_val += val
        }

    }

    const avg_buy_px = tot_buy_val / tot_buy
    const avg_sell_px = tot_sell_val / tot_sell
    const abs_tot_sell = -tot_sell

    if (tot_buy == 0 && abs_tot_sell != 0){
        pnl = abs_tot_sell * (avg_sell_px - price)
    } else if (abs_tot_sell == 0 && tot_buy != 0){
        pnl = tot_buy * (price - avg_buy_px)
    } else if (tot_buy > abs_tot_sell){
        pnl = abs_tot_sell * (avg_sell_px - avg_buy_px) + (tot_buy - abs_tot_sell) * (price - avg_buy_px)
    } else if (tot_buy < abs_tot_sell){
        pnl = tot_buy * (avg_sell_px - avg_buy_px) + (abs_tot_sell - tot_buy) * (avg_sell_px - price)
    } else {
        pnl = (avg_sell_px * abs_tot_sell) - (avg_buy_px * tot_buy)
    }

    return {
        pnl: pnl,
        net_pos: net_pos,
        tot_buy: tot_buy,
        tot_sell: tot_sell,
        avg_buy_px: avg_buy_px,
        avg_sell_px: avg_sell_px
    }
}

export default calculate_pnl
