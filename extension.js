/************************************************************************************
 This is your Page Code. The appAPI.ready() code block will be executed on every page load.
 For more information please visit our docs site: http://docs.crossrider.com
 *************************************************************************************/
/*
 if (typeof(console) != 'object') {

 console = {
 log: function(m) {
 try { unsafeWindow.console.log(m) }
 catch(e) { alert(m) } }
 }
 }else{
 //alert('no console');
 unsafeWindow.console.log("unsafe window mode");
 }
 */

appAPI.ready(function($) {

    /*
     h = $(".docs-reference-pane-container").css("height");
     $(".goog-sa-pane-ctrl").css("width", "250px");
     $(".goog-sa-pane-ctrl").css("height", h);
     $(".docs-reference-pane-container").show();
     */
    //alert('debugging now');
    //alert('initial');
    //alert(typeof _docs_userPreferences );
    //alert('found');
    var blnNoSource = true;
    var activeProjectID = 0;
    var _timer;
    var _initialID = 0;

    if(appAPI.matchPages("*docs.google.com/*") && !appAPI.dom.isIframe()){

        var base_url = "http://local.citelighter.com";

        $(".goog-sa-pane-inner").hide();
        

        function timedPolling(){
            timer = setTimeout(function(){
                //alert('polled:' + ++ctr);
                if(($('#cl-panel').length == 0 && _initialID > 0) || (blnNoSource && _initialID > 0)){

                    //if($('#cl-panel').attr('src') == ""){
                    if(blnNoSource){
                        renderIframe(_initialID);
                    }
                    //}


                }

                timedPolling();
            },2000);
        }
        timedPolling();

        // Place your code here (you can also define new functions above this scope)
        // The $ object is the extension's jQuery object

        console.log('this is working now');

        //alert('is it done?');

        //    if (!appAPI.matchPages("*crossrider.debug/*")) return;
        if (!appAPI.matchPages("*docs.google.com/*")) {
            return;
        }else{
            //alert('googledocs');
        }


        appAPI.request.post( base_url + "/api/gp","", function(data) {
            json = JSON.parse(data);

            if(json.ok === true){
                renderSelect(json);
            }else{
                alert('failed to get data, you are not logged in.');
                clearTimeout(timer);
            }

        }, function(e) {
            alert("failed");
        });



        var renderIframe = function(p_id){

            //var _div_width = $('.goog-sa-pane-title').width();
            //var _top_offset = $('.goog-sa-pane-title').height() + parseInt($('.goog-sa-pane-title').css('padding-top')) + parseInt($('.goog-sa-pane-title').css('padding-bottom'))
            //                    + parseInt($('.goog-sa-pane-title').css("border-top-width")) + parseInt($('.goog-sa-pane-title').css("border-bottom-width"));

            if(p_id == 0) return false;

            if($(".goog-sa-pane-inner")){
                $(".goog-sa-pane-inner").show();
                var _frameHeight = $(".goog-sa-pane-ctrl").height();
                var _frameWidth = 250;

                $('#cl-panel').remove();
                if($('#cl-panel')){
                    $('<iframe id="cl-panel" src="" style="position:absolute;z-index:9999; left:0;top:0;background-color:white;width:100%;height:100%;" />').prependTo(".goog-sa-pane-inner");
                    //$('<iframe id="cl-panel" src="" style="position:absolute;z-index:9999; left:0;top:'+_top_offset+'px;background-color:white;width:100%;height:100%" />').prependTo(".goog-sa-pane-title");
                }


                src_url = base_url + '/project/view/' + p_id + '/false/true';

                if(p_id > 0){
                    $('#cl-panel').attr("src", src_url);
                    blnNoSource = false;
                    activeProjectID = p_id;
                    // alert("loaded url");
                    //addFrameEvents();
                }else{
                    alert('not found');
                }

            }

        }


        var renderSelect = function(data){
            //render the projects to the select tags
            var _select_html = "";

            if(json.rsp.length > 0){
                _select_html = '<div id="project_list_container"><select id="project_list">';
            }

            for(var key in json.rsp) {
                if(key == 0){
                    _initialID = data.rsp[key].project_id;
                }
                _select_html += '<option value="' + data.rsp[key].project_id +'">' + data.rsp[key].title + '</option>';

            }

            if(json.rsp.length > 0){
                _select_html += '</select></div>';
            }
            //alert('prepend after');
            $(_select_html).prependTo('body');
            //$('<div style="background-color:green;position:absolute;width 50px; height: 50px; z-index:9999;">persist</div>').prependTo('.goog-sa-pane-title');

            $('#project_list_container').css({'float':'right', 'position':'relative', 'z-index':'999'});

            //add change event to select tag
            $('#project_list').change(function(){

                renderIframe($(this).val());

            });
        };

        var renderCitations = function(p_id){

            if(p_id == 0) return false;

            src_url = base_url + '/project/view/' + p_id + '/false/true';

            if(p_id > 0){
                $('#cl-panel').attr("src", src_url);

            }else{
                alert('not found');
            }

        };

        var getFileID = function(){
            var _url = document.location.href;
			var url_arr = _url.split('/');
			var _file_index = url_arr.length - 2;
			return url_arr[_file_index];
        }


        var lid = appAPI.message.addListener(function(msg) {
            switch(msg.action) {
                //case 'alert': alert(msg.value); break;
                //case 'alert': alert("FROM:" + document.location.href + "\r\n" + msg.value); break;
                case 'send': //alert("say something");
                    var _file_id = getFileID();
                    var _postData = "file_id="+_file_id+ "&project_id=" +activeProjectID+ "&selected_citations="+msg.selected_citations;
                    //alert('Post request for this citations: \r\n' + msg.selected_citations + '\r\n_postData: ' + _postData);
                    appAPI.request.post( base_url + "/gd_api/update_file", _postData, function(data) {
                        parseObject = appAPI.JSON.parse(data);
                        if(parseObject.ok == true){
                            //alert('insert was ok');

                            appAPI.message.toBackground({type: "iframes", action: "remove_loading"});

                        }else{
                            alert('failed to update document');
                            appAPI.message.toBackground({type: "iframes", action: "remove_loading"});
                        }

                    });

                    break;
                default: alert('Received message with an unknown action\r\nType:' + msg.type + '\r\nAction:' + msg.action + '\r\nValue:' + msg.value); break;
            }
        });


    }else if(appAPI.dom.isIframe()) /*if(<conditions when running an iframe>)*/{

        if(!appAPI.matchPages("*citelighter.com/project/view*")){

            return false;

        }



        if($('#cl_button1')){
            $('#cl_button1').unbind();
            $('#cl_button1').click(function(){
                //$('body').on('click', '#cl_button1', function(){
                var _selectedCitations = get_selected_citations();

                if(_selectedCitations == ""){
                    alert("Please select at least one citation");
                    return false;
                }
                //$('<span class="cl_loading_message">  Updating...</span>').insertAfter('#cl_button1');
                appAPI.message.toBackground({type: "window", action: "send", selected_citations: _selectedCitations});
            });
        }

        var get_selected_citations = function(){
            var return_arr = new Array();

            $.each($('.cust_checkbox_on'), function(key, value){
                var _citation_checkbox_id = $(this).attr('id');
                var _citation_id = _citation_checkbox_id.split('_')[2];
                return_arr.push(_citation_id);
            });
            return return_arr.join("-");
        }

        //iFrame Listener
/*
        var lid = appAPI.message.addListener(function(msg) {
            if(appAPI.dom.isIframe()){
                alert("GOT: " + msg.action);
            }
            switch(msg.action) {

                case 'remove_loading': //alert("say something");
                    $(".cl_loading_message").remove();
                    break;
                case 'send':
                    $(".cl_loading_message").remove();
                    break;
                    break;
                default: alert('Frame Received message with an unknown action\r\nType:' + msg.type + '\r\nAction:' + msg.action + '\r\nValue:' + msg.value); break;
            }
        });
*/

    }


});