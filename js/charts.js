$(document).ready(function () {
    var showTime = Array.from({ length: 20 }, (_, index) => index + 1);
    var showValue = [];
    const urlParams = new URLSearchParams(window.location.search);
    const param1 = urlParams.get('code');
    const param2 = urlParams.get('name');
    const username = urlParams.get('username');

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


    var getHis_ajaxString = 'http://127.0.0.1:12345/getStockPrice?code=' + param1;

    var showArea = document.getElementById("area");
    var showChart = echarts.init(showArea);

    //初始化页面
    var ajaxDataString = $.ajax({
        url: getHis_ajaxString,
        success: function (data) {
            showValue = data;
            while (showValue.length > 20) {
                showValue.shift();
            }
            var showOption = {
                title: {
                    text: param1 + '-' + param2,
                    left: 'center',
                    textStyle: {
                        color: 'white'
                    }
                },
                xAxis: {
                    type: 'category',
                    data: showTime,
                    axixLine: {
                        show: true,
                        lineStyle: {
                            color: "#FFFFFF"
                        }
                    },
                    axisLabel: {
                        show: false,
                        textStyle: {
                            color: "#FFFFFF",
                            fontSize: 16
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    axixLine: {
                        show: true,
                        lineStyle: {
                            color: "#FFFFFF",
                            wdith: 5,
                            type: "solid"
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: "#FFFFFF",
                            fontSize: 16
                        }
                    },
                },
                series: [
                    {
                        data: showValue,
                        type: 'line',
                        symbolSize: 10,
                        lineStyle: {
                            color: '#FFFFFF',
                            width: 4
                        }
                    }
                ]
            };
            showChart.setOption(showOption);
            startTimer();
        }
    });

    //定时更新
    setInterval(function () {
        var ajaxDataString = $.ajax({
            url: getHis_ajaxString,
            success: function (data) {
                showValue = data;
                while (showValue.length > 20) {
                    showValue.shift();
                }
                var showOption = {
                    xAxis: {
                        type: 'category',
                        data: showTime,
                        axixLine: {
                            show: true,
                            lineStyle: {
                                color: "#FFFFFF"
                            }
                        },
                        axisLabel: {
                            show: false,
                            textStyle: {
                                color: "#FFFFFF",
                                fontSize: 16
                            }
                        },
                    },
                    yAxis: {
                        type: 'value',
                        axixLine: {
                            show: true,
                            lineStyle: {
                                color: "#FFFFFF",
                                wdith: 5,
                                type: "solid"
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: "#FFFFFF",
                                fontSize: 16
                            }
                        },
                    },
                    series: [
                        {
                            data: showValue,
                            type: 'line',
                            symbolSize: 10,
                            lineStyle: {
                                color: '#FFFFFF',
                                width: 4
                            }
                        }
                    ]
                };
                showChart.setOption(showOption);
                resetTimer();
                startTimer();
            }
        });
    }, 5000);

    $('#goBackBtn').click(function () {
        window.history.back();
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