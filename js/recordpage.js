$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    class stockRecorder {
        constructor() {
            this.items = [];
            for (var i = 0; i < 30; i++) {
                this.items.push({Code: '000000', Name: 'Null'});
            }
        }
        setStockInfo(index, Code, Name) {
            this.items[index].Code = Code;
            this.items[index].Name = Name;
        }
        getStockName(Code) {
            for (var i = 0; i < 30; i++) {
                if (this.items[i].Code == Code) {
                    return this.items[i].Name;
                }
            }
            return null;
        }
    }

    var stockRec = new stockRecorder();
    var requestUrl = 'http://127.0.0.1:12345/getMarketPrice';
    $.ajax({
        url: requestUrl,
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                stockRec.setStockInfo(i, data[i].Code, data[i].Name);
            }
        }
    });
    var $table = $('#tradeRecord').DataTable({
        "paging": true,
        "ordering": false,
        "info": false,
        "searching": false,
        "lengthChange": false,
        columns: [
            { data: "TradeTime", title: "TradeTime" },
            { data: "Code", title: "Code" },
            { data: "Name", title: "Name" },
            { data: "TradeDirection", title: "TradeDirection" },
            { data: "Price", title: "Price" },
            { data: "Amount", title: "Amount" },
            { data: "State", title: "State"}
        ]
    });

    $.ajax({
        url: 'http://127.0.0.1:12345/getTradeRecord?username=' + username,
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var dir = null;
                if (record.Direction == 0) {
                    dir = '买入';
                } else if (record.Direction == 1) {
                    dir = '卖出';
                }
                var money = record.Amount * record.KnockPrice;
                var state = null;
                if (record.State == 0) {
                    state = '错误';
                } else if (record.State == 1) {
                    state = '委托成功';
                } else if (record.State == 2) {
                    state = '交易成功';
                } else if (record.State == 3) {
                    state = '废单';
                } else if (record.State == 4) {
                    state = '账户余额不足';
                } else if (record.State == 5) {
                    state = '持仓余额不足';
                }
                var addedNode = $table.row.add({
                    "TradeTime": record.TradeTime,
                    "Code": record.Code,
                    "Name": stockRec.getStockName(record.Code),
                    "TradeDirection": dir,
                    "Price": record.KnockPrice.toFixed(2),
                    "Amount": record.Amount,
                    "State": state
                }).draw();
            }
        }
    })

    $('#returnButton').click(function() {
        window.location.href = 'homepage.html?username=' + username;
    })

    $('#refreshButton').click(function() {
        $.ajax({
            url: 'http://127.0.0.1:12345/getTradeRecord?username=' + username,
            success: function(data) {
                $table.clear();
                for (var i = 0; i < data.length; i++) {
                    var record = data[i];
                    var dir = null;
                    if (record.Direction == 0) {
                        dir = '买入';
                    } else if (record.Direction == 1) {
                        dir = '卖出';
                    }
                    var money = record.Amount * record.KnockPrice;
                    var state = null;
                    if (record.State == 0) {
                        state = '错误';
                    } else if (record.State == 1) {
                        state = '委托成功';
                    } else if (record.State == 2) {
                        state = '交易成功';
                    } else if (record.State == 3) {
                        state = '废单';
                    } else if (record.State == 4) {
                        state = '账户余额不足';
                    } else if (record.State == 5) {
                        state = '持仓余额不足';
                    }
                    var addedNode = $table.row.add({
                        "TradeTime": record.TradeTime,
                        "Code": record.Code,
                        "Name": stockRec.getStockName(record.Code),
                        "TradeDirection": dir,
                        "Price": record.KnockPrice.toFixed(2),
                        "Amount": record.Amount,
                        "State": state
                    }).draw();
                }
            }
        })
    })
});