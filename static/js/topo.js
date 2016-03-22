/*  拓扑配置 */
!(function(window){
    window.CC.hostConf=CC.hostConf||{};

    //首次加载的数据
    window.CC.hostConf.init = function() {
        if (level == 2) {
            var noset = true;
        }
        else {
            var noset = false;
        }
        $('#confTreeContainer').kendoTreeView({
            template: kendo.template($("#treeview-template").html()),

            dataSource: [{
                id: appId,
                text: appName,
                noset: noset,
                spriteCssClass: 'c-icon icon-app application',
                type: 'application',
                number: 200,
                expanded: true,
                items: topo
            }]
        });
        CC.hostConf.optionFn();
        // 拓扑树根据浏览器调整自身高度
            function treeHeightChange () {
                $('.host-sidebar-left').css('position','fixed');
                setTimeout(function (){
                    $('.c-host-side').css('height',$(window).outerHeight()-70-20);
                    if ($('.c-host-side').height()>820)$('.c-host-side').css('height',820);
                    $(".c-conf-tree").css('height',$('.c-host-side').outerHeight()-$('.conf-free-group').outerHeight()-$('.c-host-side>h4').outerHeight()-37);
                },200)

            }
            treeHeightChange();
            $(window).resize(function (){
                treeHeightChange();
            })
            // 拓扑树根据浏览器调整自身高度 end
    }

    //弹窗事件
    CC.hostConf.showWindow = function(Msg,level) {
        if(level=='success')
        {
            var d = dialog({
                width: 150,
                content: '<div class="c-dialogdiv2"><i class="c-dialogimg-success"></i>'+Msg+'</div>'
            });
            d.show();
        }
        else if(level =='error')
        {
            var d = dialog({
                title:'错误',
                width:300,
                okValue:"确定",
                ok:function(){},
                content: '<div class="c-dialogdiv"><i class="c-dialogimg-failure"></i>'+Msg+'</div>'
            });
            d.showModal();
        }
        else
        {
            var d = dialog({
                title:'警告',
                width:300,
                okValue:"确定",
                ok:function(){},
                content: '<div class="c-dialogdiv"><i class="c-dialogimg-prompt"></i>'+Msg+'</div>'
            });
            d.showModal();
        }
    }
    //重新请求树的数据
    CC.hostConf.addItem = function() {
        var ApplicationID = cookie.get('defaultAppId');
        $.post("/topology/gettopdata",
            {ApplicationID:ApplicationID}
            ,function(result) {
                rere = $.parseJSON(result);
                appId = rere.appId;
                appName = rere.appName;
                topo = $.parseJSON(rere.topo);
                level = rere.Level;
                desetid = rere.deSetID;
                defaultapp = rere.Default;
                emptys = rere.emptys;
                if (level == 2) {
                    var noset = true;
                }
                else {
                    var noset = false;
                }
                var hostTreeview = $("#confTreeContainer").data("kendoTreeView");
                hostTreeview.setDataSource(new kendo.data.HierarchicalDataSource({
                    data: [{
                        id: appId,
                        text: appName,
                        noset: noset,
                        spriteCssClass: 'c-icon icon-app application',
                        type: 'application',
                        number: 200,
                        expanded: true,
                        items: topo
                    }]
                }));
                CC.hostConf.optionFn();
            });
    }
    //数据加载选项应该注册的事件
    CC.hostConf.optionFn=function(){
            //隐藏set菜单
            $('#confTreeContainer').find('.c-icon.hide').closest('.k-top').hide();
            $('#confTreeContainer').find('.c-icon.hide').closest('.k-mid').hide();
            $('#confTreeContainer').find('.c-icon.hide').closest('.k-bot').hide();

            //改变默认样式
            if(emptys==1)
            {
                if(level==3)
                {
                    $('.creat-container').css('display','none');
                    $('.creat-group-container').css('display','none');
                }
                else
                {
                    $('.creat-container').css('display','none');
                    $('.creat-module-container').css('display','none');
                }
            }

            // 新增集群事件
            $(".creat-group-btn").on("click", function(e) {
                ApplicationID = cookie.get('defaultAppId');
                $('.creat-container').css('display','none');
                $('.creat-group-container').fadeIn();
                e.preventDefault();
                e.stopPropagation();
                $("#newsetname").focus();
                $.post("/Set/getAllSetInfo",
                    {ApplicationID:ApplicationID}
                    ,function(result) {
                        rere = $.parseJSON(result);
                        if(rere.success == false)
                        {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                            return;
                        }
                        else
                        {
                            //var set = rere.set;
                            //if(set.length==0)
                            //{
                            //    $("#exsitGroup").hide();
                            //}
                            //else
                            //{
                            //    var option='';
                            //    for(var i=0;i!=set.length;i++)
                            //    {
                            //        var s = set[i];
                            //        option+="<option value=\""+s.SetID+"\">"+s.SetName+"</option>";
                            //    }
                            //    $("#exsitGroup").find("select").html(option);
                            //    $("#exsitGroup").show();
                            //   }
                        }
                    });
                return false;
            });

            //新增模块事件
            $(".creat-module-btn").on("click", function(e) {
                if(defaultapp==1)
                {
                    CC.hostConf.showWindow('资源池业务不能操作','notice');
                    return;
                }
                $.post("/App/getMainterners",
                    {}
                    ,function(result) {
                        // rere = $.parseJSON(result);
                        rere = result;
                        {
                            var uinList = rere.uinList;
                            var UserNameList = rere.UserNameList;
                            var opstr='';
                            for(var i=0;i!=uinList.length;i++)
                            {
                                var uin=uinList[i];
                                opstr +=' <option value="'+uin+'">'+uin+'('+UserNameList[i]+')'+'</option>';
                            }
                            $("#Operator").html(opstr);
                            $("#BakOperator").html(opstr);
                            $("#Operator").select2();
                            $("#BakOperator").select2();
                        }
                    });
                var domNode = $(e.target).closest('.k-item'),
                    node = $("#confTreeContainer").data('kendoTreeView').dataItem(domNode);
                //对于二级业务来说重新取其setid
                if(level==2)
                {
                    var SetID = desetid;
                    var SetName = cookie.get('defaultAppName');
                    $("#newmodulebe").text("所属业务");
                }
                else
                {
                    var SetID = node.id;
                    var SetName = node.text;
                    $("#newmodulebe").text("所属集群");
                }
                $("#newmodulegroupname").text(SetName);
                $("#newmoduleModuleName").attr('setid',SetID);
                $('.creat-container').css('display','none');
                $('.creat-module-container').fadeIn();
                $("#newmoduleModuleName").focus();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            //修改模块属性事件
            $('.c-conf-tree .k-sprite.c-icon.icon-modal,.conf-free-group .k-in').parent().css('cursor','pointer').on("click dblclick", function(e) {
                var padomNode=$(e.target).closest('.k-item').closest('.k-group').closest('.k-item'),
                    panode = $("#confTreeContainer").data('kendoTreeView').dataItem(padomNode);
                var domNode = $(e.target).closest('.k-item'),
                    node = $("#confTreeContainer").data('kendoTreeView').dataItem(domNode);
                if(typeof panode == 'undefined')
                {
                    return;
                }
                //二级结构，特殊处理
                var SetID = panode.id;
                if(level ==2)
                {
                    var SetID = desetid;
                    var SetName = cookie.get('defaultAppName');
                    $("#editmodulebe").text("所属业务");
                }
                else
                {
                    var SetID = panode.id;
                    var SetName = panode.text;
                    $("#editmodulebe").text("所属集群");
                }
                $.post("/App/getMainterners",
                    {}
                    ,function(result) {
                        //rere = $.parseJSON(result);
                        rere = result;
                        {
                            var uinList = rere.uinList;
                            var UserNameList = rere.UserNameList;
                            var opstr='';
                            for(var i=0;i!=uinList.length;i++)
                            {
                                var uin=uinList[i];
                                opstr +=' <option value="'+uin+'">'+uin+'('+UserNameList[i]+')'+'</option>';
                            }
                            $("#editOperator").html(opstr);
                            $("#editBakOperator").html(opstr);
                            $("#editOperator").val(node.operator);
                            $("#editBakOperator").val(node.bakoperator);
                            $("#editOperator").select2();
                            $("#editBakOperator").select2();
                        }
                    });

//                var SetName = panode.text;
                var ModuleID = node.id;
                var ModuleName = node.text;
                $("#editmodulegroup").text(SetName);
                $("#editmoduleModuleName").val(ModuleName);
                $("#edit_module_property").html(ModuleName);
                $("#editmoduleModuleName").attr('SetID',SetID);
                $("#editmoduleModuleName").attr('ModuleID',ModuleID);
                $('.creat-container').css('display','none');
                $('.edit-module-container').fadeIn();
                $("#editmoduleModuleName").focus();
                return false;
            });

            //修改集群属性事件
            $('.creat-module-btn').parent().on('click',function (e){
                //二级业务不能操作
                if(level == 2) {
                    return;
                }
                if(defaultapp==1) {
                    CC.hostConf.showWindow('资源池业务不能操作','notice');
                    return;
                }
                var domNode = $(e.target).closest('.k-item'),
                    node = $("#confTreeContainer").data('kendoTreeView').dataItem(domNode);
                var ApplicationID = cookie.get('defaultAppId');
                var SetID = node.id;
                $("#editSetSetName").attr('setid',SetID);
                $.post("/Set/getSetInfoById",
                    {ApplicationID:ApplicationID,SetID:SetID}
                    ,function(result) {
                        // rere = $.parseJSON(result);
                        rere = result;
                        if (rere.success == false) {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                        }
                        else {
                            var set = rere.set;
                            $("#editset_property").html(set.SetName);
                            $("#editSetSetName").val(set.SetName);
                            $("#editSetEnviType").val(set.EnviType);
                            $("#edit_set_setenctype label").removeClass('active');
                            if(set.EnviType == 1) {
                                $("#edit_option1").parent().addClass('active');
                            }else if(set.EnviType == 2){
                                $("#edit_option2").parent().addClass('active');
                            }
                            else{
                                $("#edit_option3").parent().addClass('active');
                            }
                            $("#edit_set_sersta input").bootstrapSwitch({onText: '开放',
                                offText: '关闭'});
                            $('#edit_set_sersta input').bootstrapSwitch('state', set.ServiceStatus == 1);
                       //     $("#editSetServiceStatus").val(set.ServiceStatus);
                            $("#editSetChnName").val(set.ChnName);
                            $("#editSetCapacity").val(set.Capacity);
                            $("#editSetDes").val(set.Description);
                            $("#editOpenstatus").val(set.OpenStatus);
                        }
                    });
                $('.creat-container').css('display','none');
                $('.edit-group-container').fadeIn();
                $("#editSetSetName").focus();
                e.preventDefault();
                e.stopPropagation();
                return false;
            })

            //select事件
            $("#exsitGroup").find("select").change(function() {
                    var IsClone = $("#newcloneset").attr("checked");
                    console.log(IsClone);
                }
            )

            //保存新增set
            $("#save_new_set").on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                var ApplicationID = cookie.get('defaultAppId');
                var SetName = $.trim($("#newsetname").val());
                var EnviType = $("#new_set_envtype .btn-group .active input").val();
                var SerSw =  $("#new_set_sersta input").bootstrapSwitch('state');
                var ServiceStatus = SerSw? 1:0;
                var ChnName = $.trim($("#newSetChnName").val());
                var Des = $.trim($("#newSetdes").val());
                var Capacity = $.trim($("#newSetCapacity").val());
                var Openstatus = $.trim($("#newOpenstatus").val());
                if(SetName.length==0 ){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群名不能为空</span>'
                    });
                    diaCopyMsg.show($("#newsetname").get(0));
                    return ;
                }
                if( SetName.length > 64){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群名过长</span>'
                    });
                    diaCopyMsg.show($("#newsetname").get(0));
                    return ;
                }
                if(ChnName.length > 32){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群中文名过长</span>'
                    });
                    diaCopyMsg.show($("#newSetChnName").get(0));
                    return ;
                }
                if(Des.length > 250){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">描述过长</span>'
                    });
                    diaCopyMsg.show($("#newSetdes").get(0));
                    return ;
                }
                if(Capacity >9990000) {
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">请输入合理容量</span>'
                    });
                    diaCopyMsg.show($("#newSetCapacity").get(0));
                    return ;
                }
                $.post("/Set/newSet",
                    {ApplicationID:ApplicationID,SetName:SetName,EnviType:EnviType,ServiceStatus:ServiceStatus,
                        ChnName:ChnName,Capacity:Capacity,Des:Des,Openstatus:Openstatus}
                    ,function(result) {
                        // rere = $.parseJSON(result);
                        rere = result;
                        if (rere.success == false) {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                            return;
                        }
                        else {
                            CC.hostConf.showWindow('新增集群成功！','success');
                            setTimeout(function(){window.location.reload();},1000);
                        }
                    });
            });

            //删除set
            $("#editsetdelete").on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                var gridBatDel = dialog({
                    title:'确认',
                    width:250,
                    content: '是否确认删除集群？',
                    okValue:"确定",
                    cancelValue:"取消",
                    ok:function (){
                        var ApplicationID = cookie.get('defaultAppId');
                        var SetID = $("#editSetSetName").attr('setid');
                        $.post("/Set/delSet",
                            {ApplicationID:ApplicationID,SetID:SetID}
                            ,function(result) {
                                // rere = $.parseJSON(result);
                                rere = result;
                                if (rere.success == false) {
                                    CC.hostConf.showWindow(rere.errInfo,'notice');
                                    return;
                                }
                                else {
                                    CC.hostConf.showWindow('删除集群成功！','success');
                                    setTimeout(function(){window.location.reload();},1000);
                                }
                            });
                    },
                    cancel: function () {
                    }
                });
                gridBatDel.showModal();
            });

            //保存set修改
            $("#editsetsave").on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                var ApplicationID = cookie.get('defaultAppId');
                var SetID = $("#editSetSetName").attr('setid');
                var SetName = $.trim($("#editSetSetName").val());
                var EnviType = $("#edit_set_setenctype .btn-group .active input").val();
                var ServiceStatus = $("#edit_set_sersta input").bootstrapSwitch('state') ? 1:0;
                //var EnviType = $("#editSetEnviType").val();
                //var ServiceStatus = $("#editSetServiceStatus").val();
                var ChnName = $.trim($("#editSetChnName").val());
                var Des = $.trim($("#editSetDes").val());
                var Capacity = $.trim($("#editSetCapacity").val());
                var Openstatus = $.trim($("#editOpenstatus").val());
                if(SetName.length==0 ){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群名不能为空</span>'
                    });
                    diaCopyMsg.show($("#editSetSetName").get(0));
                    return ;
                }
                if(SetName.length > 64){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群名过长</span>'
                    });
                    diaCopyMsg.show($("#editSetSetName").get(0));
                    return ;
                }
                if(ChnName.length > 32){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">集群中文名过长</span>'
                    });
                    diaCopyMsg.show($("#editSetChnName").get(0));
                    return ;
                }
                if(Des.length > 250){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">描述过长</span>'
                    });
                    diaCopyMsg.show($("#editSetDes").get(0));
                    return ;
                }
                if(Capacity >9990000) {
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">请输入合理容量</span>'
                    });
                    diaCopyMsg.show($("#editSetCapacity").get(0));
                    return ;
                }
                $.post("/Set/editSet",
                    {ApplicationID:ApplicationID,SetName:SetName,SetEnviType:EnviType,ServiceStatus:ServiceStatus,
                        ChnName:ChnName,Capacity:Capacity,Des:Des,SetID:SetID,Openstatus:Openstatus}
                    ,function(result) {
                        // rere = $.parseJSON(result);
                        rere = result;
                        if (rere.success == false) {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                            return;
                        }
                        else {
                            CC.hostConf.showWindow('修改集群成功！','success');
                            setTimeout(function(){window.location.reload();},1000);
                            return;
                        }
                    });
            });

        //新建集群取消事件
        $("#new_set_cancel").on('click',function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(".col-md-12.creat-container.creat-group-container").hide();
        });

        //新建模块取消事件
        $("#new_module_cancel").on('click',function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(".col-md-12.creat-container.creat-module-container").hide();
        });

            //保存新增模块
            $("#newsavemodule").on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                var ApplicationID = cookie.get('defaultAppId');
                var SetID = $("#newmoduleModuleName").attr('setid');
                var ModuleName = $.trim($("#newmoduleModuleName").val());
                var Operator = $("#Operator").val();
                var BakOperator = $("#BakOperator").val();
                if(ModuleName.length==0 ){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">模块名不能为空</span>'
                    });
                    diaCopyMsg.show($("#newmoduleModuleName").get(0));
                    return ;
                }
                if(ModuleName.length>60){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">模块名过长</span>'
                    });
                    diaCopyMsg.show($("#newmoduleModuleName").get(0));
                    return ;
                }
                $.post("/Module/newModule",
                    {ApplicationID:ApplicationID,SetID:SetID,ModuleName:ModuleName,Operator:Operator,BakOperator:BakOperator}
                    ,function(result) {
                        // rere = $.parseJSON(result);
                        rere = result;
                        if (rere.success == false) {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                            return;
                        }
                        else {
                            if(firstmodule && firstapp){
                                var d = dialog({
                                    title:'提示',
                                    width:300,
                                    height:30,
                                    okValue:"确定",
                                    ok:function(){window.location.href = '/host/hostQuery#em';return false;},
                                    onclose:function(e){window.location.reload();},
                                    content: '<div class="c-dialogdiv"><i class="c-dialogimg-success"></i>'+'模块添加好了，就差最后一步啦，点确定去往模块里添加主机'+'</div>'
                                });
                                d.showModal();
                                return;
                            }
                            else{
                                CC.hostConf.showWindow('新增模块成功！','success');
                                setTimeout(function(){window.location.reload();},1000);
                                return;
                            }
                        }
                    });
            });

            //保存模块修改
            $("#editmodulesave").on('click',function(e){
                var ApplicationID = cookie.get('defaultAppId');
                var SetID = $("#editmoduleModuleName").attr("setid");
                var ModuleID = $("#editmoduleModuleName").attr("moduleid");
                var ModuleName = $.trim($("#editmoduleModuleName").val());
                var Operator = $("#editOperator").val();
                var BakOperator = $("#editBakOperator").val();
                if(ModuleName.length==0 ){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">模块名不能为空</span>'
                    });
                    diaCopyMsg.show($("#editmoduleModuleName").get(0));
                    return ;
                }
                if(ModuleName.length>60){
                    var diaCopyMsg = dialog({
                        quickClose: true,
                        align: 'left',
                        padding:'5px 5px 5px 10px',
                        skin: 'c-Popuplayer-remind-left',
                        content: '<span style="color:#fff">模块名过长</span>'
                    });
                    diaCopyMsg.show($("#editmoduleModuleName").get(0));
                    return ;
                }
                $.post("/Module/editModule",
                    {ApplicationID:ApplicationID,ModuleID:ModuleID,ModuleName:ModuleName,SetID:SetID,Operator:Operator,BakOperator:BakOperator}
                    ,function(result) {
                        rere = $.parseJSON(result);
                        if (rere.success == false) {
                            CC.hostConf.showWindow(rere.errInfo,'notice');
                            return;
                        }
                        else {
                            CC.hostConf.showWindow('更新模块成功！','success');
                            setTimeout(function(){window.location.reload();},1000);
                            return;
                        }
                    });
            });

            //删除模块
            $("#editmoduledelete").on('click',function(e){
                e.preventDefault();
                e.stopPropagation();
                var gridBatDel = dialog({
                    title:'确认',
                    width:250,
                    content: '是否删除选中模块',
                    okValue:"确定",
                    cancelValue:"取消",
                    ok:function (){
                        var ApplicationID = cookie.get('defaultAppId');
                        var SetID = $("#editmoduleModuleName").attr("setid");
                        var ModuleID = $("#editmoduleModuleName").attr("moduleid");
                        $.post("/Module/delModule",
                            {ApplicationID:ApplicationID,ModuleID:ModuleID,SetID:SetID}
                            ,function(result) {
                                rere = $.parseJSON(result);
                                if (rere.success == false) {
                                    CC.hostConf.showWindow(rere.errInfo,'notice');
                                    return;
                                }
                                else {
                                    CC.hostConf.showWindow('删除模块成功！','success');
                                    setTimeout(function(){window.location.reload();},1000);
                                }
                            });
                    },
                    cancel: function () {
                    }
                });
                gridBatDel.showModal();

            });

        //
        $(document).on("click", ".conf-delete-link", function(e) {
            e.preventDefault();
            var hostTreeview = $("#confTreeContainer").data("kendoTreeView");
            if ($(".k-state-selected").find('.application').length>0)return false;
            hostTreeview.remove($(".k-state-selected"));
        });

    }
})(window);
/* 拓扑配置 end */
$(function() {
    $(".c-host-switch").click(function(){
        if($('.c-host-switch-img').hasClass("glyphicon-menu-left")){
            $('.c-host-switch-img').removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
            $(".host-sidebar-left").animate({"width": "0px"}, "fast");
            $(".host-main-right").animate({"right": "+=320px","width": "+=320px"}, "fast");
        }else if($('.c-host-switch-img').hasClass("glyphicon-menu-right")){
            $('.c-host-switch-img').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
            $(".host-sidebar-left").animate({"width": "320px"}, "fast");
            $(".host-main-right").animate({"right": "-=320px","width": "-=320px"}, "fast");
        }
    })

    $("[name='my-checkbox']").bootstrapSwitch();
    $("#new_set_sersta input").bootstrapSwitch(
        {onText: '开放',
            offText: '关闭'}
    );
    $(".c-conf-tree").mCustomScrollbar({
        //setHeight: 400, //设置高度
        theme: "minimal-dark" //设置风格
    });
    $('#date1').kendoDatePicker({
        value : new Date(),
        format : "yyyy-MM-dd"
    });
    $('#date2').kendoDatePicker({
        value : new Date(),
        format : "yyyy-MM-dd"
    });
    CC.hostConf.init();

    function firstOption(){
        if (firstmodule==1) {
            if(level ==3 ) {
                var txt = '在配置平台里，我们将完成同一业务逻辑功能的主机集合称之为<strong >模块</strong>，一个业务可以由多个集群组成，而一个集群可以由多个模块组成';
            }
            else if(level==2){
                var txt = '在配置平台里，我们将完成同一业务逻辑功能的主机集合称之为<strong >模块</strong>，一个业务可以由多个模块组成';
            }
            var firstModuleBtn=$("#confTreeContainer .creat-module-btn").eq(0);
            firstModuleBtn.attr('id','first_creat_module');
            function startIntro1(){
                var intro = introJs();
                intro.setOptions({
                    exitOnOverlayClick:false,
                    skipLabel:'我知道了',
                    doneLabel:'我知道了',
                    showBullets:false,
                    showButtons:true,
                    showStepNumbers:false,
                    tooltipClass:"first_creat_msg module-msg",
                    steps: [
                        {
                            element: document.querySelector('#first_creat_module'),
                            intro: txt
                        }
                    ]
                });

                intro.start();
            }
            startIntro1();
            $("#first_creat_module").on('click',function (){
                introJs().exit();
            })
        }else if(firstset==1) {

            var firstGroupBtn=$("#confTreeContainer .creat-group-btn").eq(0);
            firstGroupBtn.attr('id','first_creat_group');
            function startIntro2(){
                var intro = introJs();
                intro.setOptions({
                    exitOnOverlayClick:false,
                    skipLabel:'我知道了',
                    doneLabel:'我知道了',
                    showBullets:false,
                    showButtons:true,
                    showStepNumbers:false,
                    tooltipClass:"first_creat_msg group-msg",
                    steps: [
                        {
                            element: document.querySelector('#first_creat_group'),
                            intro: '在配置平台里，我们将游戏中的区服称之为<strong >集群</strong>，一个业务可以由多个集群组成'
                        }
                    ]
                });

                intro.start();
            }
            startIntro2();
            $("#first_creat_group").on('click',function (){
                introJs().exit();
            })

        };

    }
    firstOption();
})