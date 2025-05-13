$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    class stockRecorder {
        constructor() {
            this.items = [];
            for (var i = 0; i < 30; i++) {
                this.items.push({ Code: '000000', Name: 'Null' });
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

    var second = 5;     // 这里的值需要与下面表格刷新的setInterval中的刷新时间对应
    var clock;
    function resetTimer() {
        clearInterval(clock);
        second = 5;
        $("#pos-timer").text('刷新时间: ' + second + 's');
    }
    function startTimer() {
        clock = setInterval(timer, 1000);
    }
    function timer() {
        second--;
        $("#pos-timer").text('刷新时间: ' + second + 's');
    }

    var stockRec = new stockRecorder();
    var requestUrl = 'http://127.0.0.1:12345/getMarketPrice';
    $.ajax({
        url: requestUrl,
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                stockRec.setStockInfo(i, data[i].Code, data[i].Name);
            }
        }
    });
    var $table = $('#positiontable').DataTable({
        "paging": true,
        "ordering": false,
        "info": false,
        "searching": false,
        "lengthChange": false,
        columns: [
            { data: "Code", title: "Code" },
            { data: "Name", title: "Name" },
            { data: "Amount", title: "Amount" },
            { data: "BuyingPrice", title: "BuyingPrice" },
            { data: "CurrentPrice", title: "CurrentPrice" },
            { data: "ProfitAndLoss", title: "Profit And Loss" }
        ],
        columnDefs: [
            {
                targets: 1,
                orderable: false
            }
        ]
    });
    var getPosUrl = "http://127.0.0.1:12345/getInventory?username=" + username;
    var userPos = null;
    $.ajax({
        url: getPosUrl,
        success: function (data) {
            userPos = data;
            $.ajax({
                url: requestUrl,
                success: function (data) {
                    if (userPos != null) {
                        for (var i = 0; i < userPos.length; i++) {
                            var reco = userPos[i];
                            var curPrice = 0.0;
                            for (var j = 0; j < data.length; j++) {
                                var stock = data[j];
                                if (stock.Code == reco.Code) {
                                    curPrice = stock.Price;
                                    break;
                                }
                            }
                            var Profit_Loss = curPrice * reco.Amount - reco.Total_Cost;
                            var addedNode = $table.row.add({
                                "Code": reco.Code,
                                "Name": stockRec.getStockName(reco.Code),
                                "Amount": reco.Amount,
                                "BuyingPrice": reco.AVG_Cost.toFixed(2),
                                "CurrentPrice": curPrice,
                                "ProfitAndLoss": Profit_Loss.toFixed(2)
                            }).draw();
                        }
                    }
                    startTimer();
                    setInterval(function () {
                        var userPos = null;
                        $.ajax({
                            url: getPosUrl,
                            success: function (data) {
                                userPos = data;
                                $.ajax({
                                    url: requestUrl,
                                    success: function (data) {
                                        $table.clear();
                                        if (userPos != null) {
                                            for (var i = 0; i < userPos.length; i++) {
                                                var reco = userPos[i];
                                                var curPrice = 0.0;
                                                for (var j = 0; j < data.length; j++) {
                                                    var stock = data[j];
                                                    if (stock.Code == reco.Code) {
                                                        curPrice = stock.Price;
                                                        break;
                                                    }
                                                }
                                                var Profit_Loss = curPrice * reco.Amount - reco.Total_Cost;
                                                var addedNode = $table.row.add({
                                                    "Code": reco.Code,
                                                    "Name": stockRec.getStockName(reco.Code),
                                                    "Amount": reco.Amount,
                                                    "BuyingPrice": reco.AVG_Cost.toFixed(2),
                                                    "CurrentPrice": curPrice,
                                                    "ProfitAndLoss": Profit_Loss.toFixed(2)
                                                }).draw();
                                            }
                                        }
                                        resetTimer();
                                        startTimer();
                                    }
                                });
                            }
                        })
                    }, 5000);
                }
            });
        }
    })

    $('#posReturnButton').click(function () {
        window.location.href = 'homepage.html?username=' + username;
    })
});