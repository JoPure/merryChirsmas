# 圣诞活动
活动描述：主要是游戏累计登录日数领奖，竞猜模块,游戏活跃人数到达一定条件时可领奖,
竞猜分为三期,选中5个人物，有系统随机生成,玩家与系统有猜中的，以5中3,5中4，5中5来得到不同的游戏奖励

# 活动功能
 * 登录
    *  `sdk游戏账号登录`
    *  `fb账号登录`
* 玩家选区服加载对应角色
 * 游戏日登陆及活跃人数领奖,初始化的接口会对应的活动进行情况查询（是否开始，是否已领取）
 * `竞猜模块`分为三期进行
 * 选中则高亮,活动时间开始后,玩家选中5个英雄（不得少于或者大于5）,未提交前可以重新选,
 * 玩家选中,玩家未选,系统开奖,我中奖分别有不同的css样式展示
 * 相关弹窗提示


# 竞猜模块
竞猜模块纠结很久,这是运律陪加班敲的,现在想起来依旧觉得感动,我是实在不会，处于懵的状态,所以想着记录下来这次活动,
会把竞猜模块的流程详细的给附上,日后对于类似活动可以参考下，算是总结

先上个流程图,第一次画流程图,真是失败...勉强看下,
![流程图](https://github.com/JoPure/merryChirsmas/blob/master/merryChirs/readmeImg/readPic_1_2.png)

![截图](https://github.com/JoPure/merryChirsmas/blob/master/merryChirs/readmeImg/readPic_1_1.png)


# 分解
按照分数来规划,是否开奖以及玩家是否选中

* <font color=red>我1分系统2分</font>
* 0分: 我没选系统没选
 * 1分: 我选了系统没选
 * 2分: 我没选系统选了
 * 3分: 我选了系统选了


###  1、查询竞猜期数
>  查竞猜期数时，会按照系统返回的数据来核对用户是否选择以及目前进行到第几期

```javascript
//竞猜 查竞猜期数
function guessInfoActivity() {
    //我1分系统2分
    //0: 我没选系统没选
    //1: 我选了系统没选
    //2: 我没选系统选了
    //3: 我选了系统选了
    for (var i = 0; i < 3; i++) {
           guessArr[i] = new Array();
           for (var k = 0; k < 10; k++) {
               guessArr[i][k] = 0;
           }
       }
    var params = {
        actId: pg_config.data.actId2,
        groupId: pg_config.data.groupId,
        token: globalData.token,
        rewardId: '5a267869422ebf06b80838af'
    };
    var d = $.Deferred();
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            //循环
            for (var z = 0; z < 3; z++) {
                if (result.state.SystemTicket && result.state.UserTicket) {
                    if (result.state.SystemTicket[z]) {
                        for (var x = 0; x < 5; x++) {
                            var cur = result.state.SystemTicket[z][x];
                            guessArr[z][cur] += 2;
                        }
                    }
                    if (result.state.UserTicket[z]) {
                        $(".menu-bar ul li").eq(z).addClass("disClick");
                        for (var y = 0; y < 5; y++) {
                            var cur = result.state.UserTicket[z][y];
                            guessArr[z][cur] += 1;
                        }
                    }
                    $(".startTime").text(pg_config.data.startTime[z - 1]);
                }
            }
            getJsonLength(result.state.UserTicket);
            //由于三期状态不同，需要按照期数来判断其他按钮是否可点击，期数按钮以及提交竞猜按钮跟已领取奖励按钮的切换，
            $(".act-desc span").text(globalData.canGuessCount);
            $(".menu-bar ul li").eq(0).removeClass("step").trigger("click");
            $(".submitBtn").removeClass('haveAward_btn');
            if (result.state.SystemTicket && result.state.SystemTicket[0]) {
                $(".menu-bar ul li").eq(1).removeClass("step").trigger("click");
                $(".submitBtn").removeClass('haveAward_btn');
            }
            if (result.state.SystemTicket && result.state.SystemTicket[1]) {
                $(".menu-bar ul li").eq(2).removeClass("step").trigger("click");
                $(".submitBtn").removeClass('haveAward_btn');
            }
        }
        else {
            tip(pg_config.status[result.code]);
        }
    })
    return d.promise();
};
```


#### 1(1)、补充
怕回头再看会忘记，所以这里把上面的for循环说明下缘由，

> 这里是个二维数组 , i 是期数, k 是竞猜个数
 ```javascript
         for (var i = 0; i < 3; i++) {
                guessArr[i] = new Array();
                for (var k = 0; k < 10; k++) {
                    guessArr[i][k] = 0;
                }
            } 
```

 ``` javascript
 //result.state.SystemTicket && result.state.UserTicket 是后端返回的数据，
 systemTickey跟UserTickty都会返回数字格式，未开奖或者未选则为空
 //系统开奖是0，1，2，3，4号，玩家选中1，2，5，9，8号，
 例如：  
  {
    SystemTicket:'01234',
    UserTicket:'12598'
  }  
 
 ``` 


 ``` javascript
//根据后台返回的数据进行期数循环,小于3是只有3期，x是选中的号码，号码个数小于5，
//系统开奖了，则第一期，按照选的个数加2分，用户选了，则加1分
         for (var z = 0; z < 3; z++) {
                if (result.state.SystemTicket && result.state.UserTicket) {
                    if (result.state.SystemTicket[z]) {
                        for (var x = 0; x < 5; x++) {
                            var cur = result.state.SystemTicket[z][x];
                            guessArr[z][cur] += 2;
                        }
                    }
                    if (result.state.UserTicket[z]) {
                        $(".menu-bar ul li").eq(z).addClass("disClick");
                        for (var y = 0; y < 5; y++) {
                            var cur = result.state.UserTicket[z][y];
                            guessArr[z][cur] += 1;
                        }
                    }
                    $(".startTime").text(pg_config.data.startTime[z - 1]);
                }
            }
 ```


### 2、玩家选中宠物后进行竞猜


> 竞猜按钮是同一个，但是有三种状态，接口里是根据样式名来做判断
* 提交竞猜  （submitBtn）
* 等待开奖  （wait_btn）
* 领取奖励  （guessAward_btn）
* 已经领取  （haveAward_btn）

所以我们会根据按钮的状态来判断当前竞猜的情况已经玩家的竞猜情况，

``` javascript
//点击提交竞猜
$(".submitBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        if ($(".submitBtn").hasClass("guessAward_btn")) {
            //领取竞猜奖励
            getGuessAward();
        } else {
            if (!$(".menu-bar ul li.active").hasClass("disClick")) {
                //如果是竞猜
                pg_config.data.dataActId = "";
                for (var i = 0; i < 10; i++) {
                    if ($(".guess-item").eq(i).hasClass("active")) {
                        pg_config.data.dataActId += i;
                    }
                }
                if (pg_config.data.dataActId.length < 5) {
                    tip(pg_config.tip.tip8);
                } else {
                    sumbitGuess();
                }
            }
        }
    }
    else {
        showLogin();
    }
});

//竞猜状态 提交竞猜
function sumbitGuess() {
    var params = {
        groupId: pg_config.data.groupId,
        actId: pg_config.data.actId2,
        ticket: pg_config.data.dataActId,
        token: globalData.token,
        step: $(".menu-bar ul li.active").index()
    };
    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
        if (result.code == 200) {
            tip('Bạn đã xác nhận lựa chọn cuối cùng, không thể sửa đổi');
            $(".submitBtn").addClass('wait_btn');
            if (globalData.canGuessCount < 3) {
                globalData.canGuessCount++;
                $(".act-desc span").text(globalData.canGuessCount);
            }
            $(".black-bg2").show();
            guessInfoActivity();
        }
        else if (result.code == 1005) {
            tip('Bạn đã gửi rồi, xin hãy đợi kết quả');
        }
        else {
            tip(pg_config.status[result.code]);
            console.log('submitBtnClick' + pg_config.status[result.code]);
        }
    });
}

//竞猜状态 领取竞猜奖励
function getGuessAward() {
    var x = $(".menu-bar ul li.active").index();
    var shutNum = 0;
    for (var y = 0; y < 10; y++) {
        if (guessArr && guessArr[x] && guessArr[x][y] > 2) {
            shutNum += 1;
        }
    }
//如果小于3,提示遗憾没有中奖
    if (shutNum < 3) {
        tip(pg_config.tip.tip6);
    } else {
        var temp = pg_config.data.giftId[shutNum - 3];
        //领取竞猜奖励
        var data = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId2,
            rewardId: temp,//对应期数的rewardId
            token: globalData.token,
            step: $(".menu-bar ul li.active").index()
        };
        ajaxDataController(requestUrl.joinActivityUrl, data, function (result) {
            if (result.code == 200) {
                $(".submitBtn").addClass('haveAward_btn');
                $(".lookAward-ul ul li").hide();
                $(".black-bg").show();
                $(".lookAward-ul").removeClass('top');
                $(".lookAwardbox p.tip-desc").text(pg_config.tip.tip4).show();
                $(".lookAwardbox p.code").text(result.state.cdKeys).show();
                $(".show-award-box").show();
                //根据5中3,5中4,5中5奖励情况显示不同的奖励图
                switch (result.state.rewardId) {
                    case pg_config.data.giftId[0]:
                        $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-3").show();
                        break;
                    case pg_config.data.giftId[1]:
                        $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-2").show();
                        break;
                    case  pg_config.data.giftId[2]:
                        $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-1").show();
                        break;
                }
            }
            else {
                tip(pg_config.status[result.code]);
                console.log('submitBtnGetAwardClick' + pg_config.status[result.code]);
            }
        });
    }
}
```


### 3、查询竞猜历史并查看竞猜中奖历史

```javascript
//竞猜 查竞猜历史
function guessGetHistory() {
    if (isLogin() && isChoose()) {
        var params = {
            actId: pg_config.data.actId2,
            groupId: pg_config.data.groupId,
            token: globalData.token
        };
        ajaxDataController(requestUrl.getHistroy, params, function (result) {
            if (result.code == 200) {
                if (result.state.length > 0) {
                    pg_config.data.guessHis = result.state;
                }
            }
            else {
                console.log('guessGetHistory' + pg_config.status[result.code]);
            }
        });
        pg_config.data.shutNum = new Array();
        for (var x = 0; x < 3; x++) {
            var shutNum = 0;
            for (var y = 0; y < 10; y++) {
                if (guessArr && guessArr[x] && guessArr[x][y] > 2) {
                    shutNum += 1;
                }
            }
            pg_config.data.shutNum[x] = shutNum;
        }
        return true;
    }
    return false;
}

```

```javascript
//点击查看获取竞猜期数历史奖励
$(".lookAward-ul ul li").on("click", function () {
    $(".lookAward-ul ul li.active").removeClass("active");
    $(".lookAwardbox p.tip-desc").hide();
    $(".lookAward-ul").addClass('top');
    $(this).addClass("active");
    var index = $(this).index();  //3
    console.log(pg_config.data.shutNum);
    var flag = false;
    var num = 0;
    for (var i = 0; i < pg_config.data.guessHis.length; i++) {
        if (pg_config.data.guessHis[i].extInfo.step == index) {
            flag = true;
            num = i;
            break;
        }
    }
    if (flag) {
        switch (pg_config.data.shutNum[index]) {  //3
            case 3:
                $(".lookAwardbox p.code").text(pg_config.data.guessHis[num].cdKeys).show();
                $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-3").show();
                break;
            case 4:
                $(".lookAwardbox p.code").text(pg_config.data.guessHis[num].cdKeys).show();
                $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-2").show();
                break;
            case 5:
                $(".lookAwardbox p.code").text(pg_config.data.guessHis[num].cdKeys).show();
                $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-1").show();
                break;
            default:
                $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").hide();
                var tips = pg_config.tip.tip3;
                for (var i = 0; i < 10; i++) {
                    if (guessArr && guessArr[index] && guessArr[index][i] > 1) {
                        tips = pg_config.tip.tip6
                    }
                }
                $(".lookAwardbox p.code").empty();
                $(".lookAwardbox p.tip-desc").text(tips).show();
                break;
        }
    }
    else {
        var vflag = false;
        //循环长度,如果分数大于1的，说明我选了也系统出结果了,但是可能没中奖或者我没有领取奖励
        for (var k = 0; k < guessArr[index].length; k++) {
            if (guessArr[index][k] > 1) {
                vflag = true;
            }
        }
        $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").hide();
        $(".lookAwardbox p.code").empty();
        if (vflag) {
            $(".lookAwardbox p.tip-desc").text('Chưa trúng giải').show();
        } else {
            $(".lookAwardbox p.tip-desc").text('Đợt này chưa công bố kết quà hoặc chưa nhận code hoặc chưa trúng giải').show();
        }
    }
});

```


#### 3(1)、补充
> shutNum是分数
会把各期竞猜情况进行分数统计，后面我们会用到这个参数，在查看中奖历史时，这个分数会帮助我们分清玩家的历史获奖奖励图片
`注意：我们的奖励图片是不一样的，5中3,5中4,5中5不同的三张图`

```javascript
pg_config.data.shutNum = new Array();
        for (var x = 0; x < 3; x++) {
            var shutNum = 0;
            for (var y = 0; y < 10; y++) {
                if (guessArr && guessArr[x] && guessArr[x][y] > 2) {
                    shutNum += 1;
                }
            }
            pg_config.data.shutNum[x] = shutNum;
        }
        return true;
```


### 4、点击对应期数进行竞猜 

* 我1分系统2分
* 0: 我没选系统没选 （actItem-unchar）
* 1: 我选了系统没选 （actItem-out）
* 2: 我没选系统选了 （system-icon）
* 3: 我选了系统选了 （actItem-win）
         
        
```javascript
$(".menu-bar ul li").on("click", function () {
    if ($(this).hasClass('step')) {
        tip('Event chưa mở 当期竞猜还未开始');
    }
    else {
        //count为选中的数字
        pg_config.data.count = 0;
        if (!$(this).hasClass("active")) {
            $(".menu-bar ul li").removeClass("active");
            $(this).addClass("active");
        }
        $(".submitBtn").removeClass('haveAward_btn');
        var index = $(this).index();//第几期
        $(".startTime").text(pg_config.data.startTime[index]);
        var all = 0;
        var systemFlag = false; //系统是否出结果了
        var userFlag = false; //我是否选了
        for (var i = 0; i < 10; i++) {
            if (guessArr && guessArr[index]) {
                switch (guessArr[index][i]) {
                    case 1:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("active").removeClass("out win");
                        break;
                    case 2:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("out").removeClass("active win");
                        break;
                    case 3:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("win").removeClass("out active");
                        break;
                    default:
                        $(".guess-main").find("div.guess-item").eq(i).removeClass("active out win");
                        $(".guess-main").find("div.guess-item").eq(i).removeClass("active out win");
                        break;
                }
                if (guessArr[index][i] > 1) {
                    systemFlag = true;
                }
                if (guessArr[index][i] == 1 || guessArr[index][i] == 3) {
                    userFlag = true;
                }
                all += guessArr[index][i];
            }
        }
        if (userFlag && !systemFlag) {
            $(".act-choose span").text('5');
            $(".submitBtn").removeClass("guessAward_btn guessHaveAward_btn noAward_btn").addClass("wait_btn");
        }
        if (userFlag && systemFlag) {
            $(".act-choose span").text('5');
            $(".submitBtn").removeClass("guessHaveAward_btn noAward_btn wait_btn").addClass("guessAward_btn");
        }
        if (!userFlag) {
            $(".act-choose span").text('0');
            $(".submitBtn").removeClass("guessAward_btn guessHaveAward_btn noAward_btn wait_btn");
        }
    }
});

```

#### 4(1)、对应期数竞猜代码说明

> 循环查询
guessArr[index][i] 第index期的10只都查询
按照上面我们设定好的分数来判断，玩家是否选中以及是否中奖


```javascript
  for (var i = 0; i < 10; i++) {
            if (guessArr && guessArr[index]) {
                 switch (guessArr[index][i]) {
                    case 1:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("active").removeClass("out win");
                        break;
                    case 2:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("out").removeClass("active win");
                        break;
                    case 3:
                        $(".guess-main").find("div.guess-item").eq(i).addClass("win").removeClass("out active");
                        break;
                    default:
                        $(".guess-main").find("div.guess-item").eq(i).removeClass("active out win");
                        $(".guess-main").find("div.guess-item").eq(i).removeClass("active out win");
                        break;
                 }
             }
        }
```

>根据系统出结果以及玩家是否选中，来调整提交竞猜按钮的状态，

```javascript
        if (userFlag && !systemFlag) {
            $(".act-choose span").text('5');
            $(".submitBtn").removeClass("guessAward_btn guessHaveAward_btn noAward_btn").addClass("wait_btn");
        }
        if (userFlag && systemFlag) {
            $(".act-choose span").text('5');
            $(".submitBtn").removeClass("guessHaveAward_btn noAward_btn wait_btn").addClass("guessAward_btn");
        }
        if (!userFlag) {
            $(".act-choose span").text('0');
            $(".submitBtn").removeClass("guessAward_btn guessHaveAward_btn noAward_btn wait_btn");
        }
```
