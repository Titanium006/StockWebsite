(function ($) {
    "use strict";

    /*==================================================================
    [ Focus Contact2 ]*/
    $('.input100').each(function () {
        $(this).on('blur', function () {
            if ($(this).val().trim() != "") {
                $(this).addClass('has-val');
            } else {
                $(this).removeClass('has-val');
            }
        })
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(event) {
        event.preventDefault();

        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        if (!check)
            return;

        var username = $('input[name=username]').val();
        // console.log(username)
        var password = $('input[name=pass]').val();
        // console.log(password)
        var submitUrl = 'http://127.0.0.1:12345/login?username=' + encodeURIComponent(username) + '&pwd=' + encodeURIComponent(password);
        console.log(submitUrl)
        $.get(submitUrl, function(response) {
            if (response) {
                console.log('登陆成功');
                window.location.href = "homepage.html?username=" + username;
            } else {
                console.error('登录失败');
                alert('登陆失败，请检查您的用户名和密码！');
            }
        }).fail(function(xhr, status, error) {
            console.error('请求失败', error);
            alert('登录请求失败！未连接至服务器');
        });
        // return check;
    });


    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    $("#visitor-mode").on("click", function(event) {
        event.preventDefault();
        // 使用 window.location.href 跳转到另一个页面
        window.location.href = "visitorpage.html";
    });

    $('.validate-form-regis').on('submit', function(event) {
        event.preventDefault();

        var check = true;
        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        if (!check)
            return;

        var username = $('input[name=username]').val();
        var password = $('input[name=pass]').val();
        var password_confirm = $('input[name=pass-confirm]').val();
        if (password != password_confirm) {
            alert('两次输入的密码不一致！');
            $('input[name=pass]').val('');
            $('input[name=pass-confirm]').val('');
            return;
        }
        var submitUrl = 'http://127.0.0.1:12345/regist?username=' + encodeURIComponent(username) + '&pwd=' + encodeURIComponent(password);
        console.log(submitUrl);
        $.get(submitUrl, function(response) {
            if (response) {
                console.log('注册成功');
                alert('注册成功，即将转到登陆界面...');
                window.location.href = "index.html";
            } else {
                console.log('注册失败');
                alert('注册失败，请检查您的用户名');
            }
        }).fail(function(xhr, status, error) {
            console.error('请求失败', error);
            alert('注册请求失败！未连接至服务器');
        })
    })


})(jQuery);