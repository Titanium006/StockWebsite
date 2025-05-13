$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    class Recorder {
        constructor() {
            this.items = [];
            for (var i = 0; i < 30; i++) {
                this.items.push({ Code: '000000', startPrice: 0.0 });
            }
        }

        setStockInfo(index, Code, price = 0.0) {
            if (index >= 0 && index < 30) {
                this.items[index].Code = Code;
                this.items[index].startPrice = price;
            }
        }

        updateStockInfo(Code, price) {
            var delta = 0;
            var percent = 0;
            for (var i = 0; i < 30; i++) {
                if (this.items[i].Code == Code) {
                    delta = price - this.items[i].startPrice;
                    delta = delta.toFixed(2);
                    // console.log(this.items[i].startPrice);
                    percent = (delta / this.items[i].startPrice) * 100;
                    percent = percent.toFixed(2);
                    break;
                }
            }
            return [delta, percent];
        }

        getCode(index) {
            return this.items[index].Code;
        }

        setPrice(code, price) {
            // console.log('Enter setPrice!');
            for (var i = 0; i < 30; i++) {
                if (this.items[i].Code == code) {
                    this.items[i].startPrice = price;
                    break;
                }
            }
        }
    }

    var second = 5;     // 这里的值需要与下面表格刷新的setInterval中的刷新时间对应
    var clock;
    function resetTimer() {
        clearInterval(clock);
        second = 5;
        $("#timer").text('刷新时间: ' + second + 's');
    }
    function startTimer() {
        clock = setInterval(timer, 1000);
    }
    function timer() {
        second--;
        $("#timer").text('刷新时间: ' + second + 's');
    }

    var stockRecorder = new Recorder();
    var curTablePage = "shanghai";
    var $table = $('#example').DataTable({
        "paging": false,
        "ordering": true,
        "info": false,
        "searching": false,
        columns: [
            { data: "Code", title: "Code" },
            { data: "Name", title: "Name" },
            { data: "Price", title: "Price" },
            { data: "Change", title: "Change" },
            { data: "ChangePercent", title: "Percent Change" },
            { data: null, title: "Operation" }
        ],
        columnDefs: [{
            targets: -1,
            orderable: false,
            render: function (data, type, full, meta) {
                return "<input type='button' class='btn btn-secondary' id='testButton' value='查看详情'>"
            }
        }, {
            targets: 1,
            orderable: false
        }, {
            targets: 2,
            className: 'dt-center'
        }]
    });
    $('#example').on('click', '#testButton', function () {
        //获取行
        var row = $("table#example tr").index($(this).closest("tr"));
        //获取某列（从0列开始计数）的值
        var code = $("table#example").find("tr").eq(row).find("td").eq(0).text();
        var name = $("table#example").find("tr").eq(row).find("td").eq(1).text();
        if (username != null) {
            var params = 'code=' + code + '&name=' + name + 'username=' + username;
            var newUrl = 'charts.html?' + params;
            window.location.href = newUrl;
        } else {
            var params = 'code=' + code + '&name=' + name;
            var newUrl = 'visitorcharts.html?' + params;
            window.location.href = newUrl;
        }
    })
    var ajaxString = "http://127.0.0.1:12345/getMarketPrice";

    $.ajax({
        url: ajaxString,
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var stock = data[i];
                stockRecorder.setStockInfo(i, stock.Code);
                var reqUrl = 'http://127.0.0.1:12345/getStockPrice?code=' + stockRecorder.getCode(i);
                // console.log(reqUrl);
                $.ajax({
                    url: reqUrl,
                    success: function (data) {
                        if (data.length != 0) {
                            var tmpUrl = this.url;
                            // console.log(tmpUrl);
                            var startIndex = tmpUrl.indexOf('code=') + 5; // 获取 'code=' 的结束位置索引
                            var endIndex = tmpUrl.indexOf('&', startIndex); // 获取 '&' 符号的位置索引，如果没有找到则返回 -1
                            // 如果没有找到 '&' 符号，则说明 code 后面没有其他参数，直接取到末尾
                            var code = endIndex !== -1 ? tmpUrl.substring(startIndex, endIndex) : tmpUrl.substring(startIndex);
                            // console.log(code);
                            stockRecorder.setPrice(code, data[0]);
                        }
                    }
                })
            }

            // 首次进入, 初始化表格
            var ajaxDataString = $.ajax({
                url: ajaxString,
                success: function (data) {
                    // console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        var stock = data[i];
                        // console.log(stock);
                        var firstChar = stock.Code.charAt(0);
                        if (firstChar == '6') {
                            var group = stockRecorder.updateStockInfo(stock.Code, stock.Price);
                            if (group[0] > 0) {
                                group[0] = '+' + group[0];
                            }
                            if (group[1] > 0) {
                                group[1] = '+' + group[1];
                            }
                            // console.log('Enter Drawing!');
                            var addedNode = $table.row.add({
                                "Code": stock.Code,
                                "Name": stock.Name,
                                "Price": stock.Price,
                                "Change": group[0],
                                "ChangePercent": group[1] + '%'
                            }).draw();
                        }
                    }
                    startTimer();
                    $("#example td:contains('-')").css('color', '#7fba00');
                    $("#example td:contains('+')").css('color', '#f25022');


                }

            });

            setInterval(function () {
                var ajaxDataString = $.ajax({
                    url: ajaxString,
                    success: function (data) {
                        var i = 0;
                        $table.clear();
                        for (var i = 0; i < data.length; i++) {
                            var stock = data[i];
                            // console.log(stock);
                            var firstChar = stock.Code.charAt(0);
                            if ((firstChar == '6' && curTablePage == 'shanghai')
                                || (firstChar == '3' && curTablePage == 'shenzhen')
                                || (firstChar == '0' && curTablePage == 'GEM')) {
                                var infoGroup = stockRecorder.updateStockInfo(stock.Code, stock.Price);
                                // console.log(infoGroup);
                                if (infoGroup[0] > 0) {
                                    infoGroup[0] = '+' + infoGroup[0];
                                }
                                if (infoGroup[1] > 0) {
                                    infoGroup[1] = '+' + infoGroup[1];
                                }
                                var addedNode = $table.row.add({
                                    "Code": stock.Code,
                                    "Name": stock.Name,
                                    "Price": stock.Price,
                                    "Change": infoGroup[0],
                                    "ChangePercent": infoGroup[1] + '%'
                                }).draw();
                            }
                        }
                        resetTimer();
                        startTimer();
                        $("#example td:contains('-')").css('color', '#7fba00');
                        $("#example td:contains('+')").css('color', '#f25022');
                    }
                });
            }, 5000);
        }
    })






    // 当单选按钮被点击时执行的函数
    $('input[type="radio"]').on('change', function () {
        // 获取当前选中的单选按钮的值
        var selectedValue = $('input[name="options"]:checked').val();
        curTablePage = selectedValue;

        var ajaxDataString = $.ajax({
            url: ajaxString,
            success: function (data) {
                var i = 0;
                $table.clear();
                for (var i = 0; i < data.length; i++) {
                    var stock = data[i];
                    // console.log(stock);
                    var firstChar = stock.Code.charAt(0);
                    if ((firstChar == '6' && curTablePage == 'shanghai')
                        || (firstChar == '3' && curTablePage == 'shenzhen')
                        || (firstChar == '0' && curTablePage == 'GEM')) {
                        var infoGroup = stockRecorder.updateStockInfo(stock.Code, stock.Price);
                        if (infoGroup[0] > 0) {
                            infoGroup[0] = '+' + infoGroup[0];
                        }
                        if (infoGroup[1] > 0) {
                            infoGroup[1] = '+' + infoGroup[1];
                        }
                        var addedNode = $table.row.add({
                            "Code": stock.Code,
                            "Name": stock.Name,
                            "Price": stock.Price,
                            "Change": infoGroup[0],
                            "ChangePercent": infoGroup[1] + '%'
                        }).draw();
                    }
                }
                $("#example td:contains('-')").css('color', '#7fba00');
                $("#example td:contains('+')").css('color', '#f25022');
            }
        });

    });
    $('#tradeButton').click(function () {
        var stockCode = $('#stockCodeInput').val();
        var optType = $('#optType').text();
        var amount = $('#amountInput').val();
        var price = $('#priceInput').val();
        if (stockCode == '' || amount == '' || price == '' || optType == '选择操作类型') {
            alert('未填写完整交易信息，请仔细检查！');
            return;
        }
        if (optType == '买入') {
            optType = 0;
        } else if (optType == '卖出') {
            optType = 1;
        }
        var optUrl = 'http://127.0.0.1:12345/trade?username=' +
            username + '&code=' + stockCode + '&direction=' + optType + '&price=' + price + '&amount=' + amount;
        var ajaxDataString = $.ajax({
            url: optUrl,
            success: function (data) {
                if (data == 0) {
                    alert('股票代码不存在！');
                } else if (data == 1) {
                    alert('委托成功！');
                } else if (data == 2) {
                    alert('交易成功！');
                } else if (data == 3) {
                    alert('废单！');
                } else if (data == 4) {
                    alert('账户余额不足！');
                } else if (data == 5) {
                    alert('持仓余额不足！');
                }
                $('#stockCodeInput').val('');
                $('#optType').text('选择操作类型');
                $('#amountInput').val('');
                $('#priceInput').val('');
            }
        })
    });
    $('#eyeIcon').click(function () {
        // 获取当前图标的路径
        var currentSrc = $("#eyeIcon").attr("src");
        // 判断当前图标路径，根据不同路径切换图标
        if (currentSrc === "images/eye-fill.png") {
            $("#eyeIcon").attr("src", "images/eye slash-fill.png");
            $('#user-balance').text('用户余额：********');
        } else {
            $("#eyeIcon").attr("src", "images/eye-fill.png");
            $.ajax({
                url: 'http://127.0.0.1:12345/getBalance?username=' + username,
                success: function (data) {
                    if (data != -1) {
                        $('#user-balance').text('用户余额：' + data.toFixed(2));
                    }
                }
            })
        }
    });
});