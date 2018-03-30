# Lottery

依赖jquery库

调用

```
let Lottery = window.RotaryLottery

or

let Lottery = window.GridLottery

new Lottery({
    chanceCount: 3, // 抽奖机会
    prizeId: 4, // 抽中第几个奖品
    newLotteryWidth: 700, // 转盘 or 九宫格 的宽
    newAreaHeight: 1000, // 抽奖区域的高
    prizeCount: 8, // 奖项数量（转盘抽奖rotary有效 ）
    beforeLottery: () => {},
    afterLottery: () => {}
})
```
