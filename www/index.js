var notChoise = true;
function choiseCity(id){
    document.getElementById('text_area').value = document.getElementById(id).innerText;
    document.getElementById('cities').style.display = 'none';
    notChoise = false;
}

$(document).ready(function () {
    var height;
    var mark = true;
    $(window).resize(function(){
        if (mark) {
            height = $(window).height();
            interval();
        }
    });

    function interval() {
        var bottomElement = document.getElementById('text_area').getBoundingClientRect();
        var gap = height - bottomElement.bottom;
        var element = document.getElementById('cities');
        if(gap < 200) {
            var topGap = document.getElementById('text_area').offsetTop;
            var maxH = (topGap > 450) ? 450 : topGap;
            var heightElement = (topGap < 200) ? 200 : topGap;
            element.style.maxHeight = heightElement+"px";
            element.style.bottom = (document.getElementById('text_area').offsetHeight+gap)+"px";
           element.style.top = 'auto';
        } else {
            var heightElement = (450 < gap) ? 450 : gap;
            element.style.maxHeight = heightElement+"px";
            element.style.bottom = "auto";
            element.style.top = bottomElement.bottom + "px";
        }
        element.style.left = bottomElement.left + "px";
    }

    document.getElementById('text_area').value = "";
    var kladr = [];
    $.getJSON('kladr.json', function (jsonArray) {
        var items = [];
        if(jsonArray.length <26) {
            document.getElementById('text_area').style.display = "none";
            items.push("<option selected='selected' disabled>Выберите город</option>");
            $.each(jsonArray, function(idJson, valueJson){
                items.push("<option value='"+valueJson.Id+"'>"+valueJson.Id+": "+valueJson.City+"</option>");
            });
            $( "<select/>", {
                class: "select_cities",
                html: items.join("")
            }).appendTo("#cities");
            mark = false;
            document.getElementById('cities').style.display="block";
            document.getElementById('cities').style.width="auto";
            document.getElementById('cities').style.border="none";
        } else {
            $.each(jsonArray, function(idJson, valueJson){
                kladr.push(valueJson);
            });            
        }
    });

    function deleteElement(){
        var div = document.getElementById('cities');
        if(div.childNodes.length != 0) {
            while (div.firstChild) div.removeChild(div.firstChild);
        }
    }

    function filterDatabase(database, str, items, startTimer, metka){
        return database.filter(function (item, nomber){
            var timerNow = Date.now();
            if (timerNow-startTimer >= 500 && metka)
                metka = loader();
            var expr = new RegExp('^'+str, "gi");
            if (expr.test(item.City)){
                items.push("<li class='city' id='"+item.Id+"' onclick='choiseCity("+item.Id+")'>"+item.City+"</li>");
                return true;
            }
            return false;
        });
    }
  
    var ok = true; 
    function stop(){
        document.getElementById('message').style.display = "none";
        document.getElementById('loader').style.display = "none";
        document.getElementById('cities').style.display = "block";
        $(window).resize();
    }

    function loader(){
        ok = false;
        document.getElementById('notFound').style.display = "none";
        document.getElementById('loader').style.display = "block";
        document.getElementById('message').style.display = "block";
        error = false;
        window.setTimeout(function (){stop();}, 1000);
        return false;
    }

    function viewResultFind(data){
        if (ok){
            document.getElementById('cities').style.display = "block";
            $(window).resize(); 
        }
        $( "<ul/>", {
            id: "list_cities",
            html: data.join("")
        }).appendTo("#cities");
        ok = true;
    }

    var database = [];
    var lastString;
    $("#text_area").keyup(function (event){
        var startTimer = Date.now();
        var area = document.getElementById('text_area').getBoundingClientRect();
        document.getElementById('message').style.left = area.left + "px";
        document.getElementById('message').style.top = area.bottom + "px";
        if (event.keyCode < 32 && event.keyCode != 8 && event.keyCode != 0) {
            return null;
        }
        var stringForSearch = $(this).val();
        if (stringForSearch == "") {
            deleteElement();
            document.getElementById('cities').style.display = 'none';
            return null;
        }
        error = false;
        document.getElementById('error').style.display = 'none';
        document.getElementById('message').style.display = 'none';
        document.getElementById('cities').style.display = 'none';
        deleteElement();
        var promise = new Promise(function(resolve, reject){
            var items = []; 
            var reg = new RegExp(lastString, "i");
            if ( reg.test(stringForSearch) && database.length != 0){
                database = filterDatabase(database, stringForSearch, items, startTimer, true);
            } else {
                database = filterDatabase(kladr, stringForSearch, items, startTimer, true);
            }
            if(items.length == 0){
                document.getElementById('notFound').style.display = 'block';
                document.getElementById('message').style.display = 'block';
                document.getElementById('cities').style.display = 'none';
                error = true;
            } else {
                resolve(items);
            }
            lastString = stringForSearch;
        });
        promise.then(viewResultFind);
    });

    $('#cities').on('mousemove DOMMouseScroll', function (event) {
        var scroll = $('#cities').scrollTop();
        if(scroll != 0)
            $("body").css("overflow","hidden"); 
    }).on('mouseleave',  function(){
       $("body").css("overflow","auto");
    });

    function blockFocusout(){
        var ul = document.getElementById('list_cities');
        var countFindCities =  (ul == null) ? 0 : ul.childNodes.length ;
        if(error || (notChoise && countFindCities > 1)){
            document.getElementById('message').style.display = 'none';
            document.getElementById('text_area').style.borderColor = "#f00";
            document.getElementById('error').style.display = 'block';
        } else {
            if(countFindCities == 1) {
                var div = document.getElementById('list_cities');
                document.getElementById('text_area').value = div.firstChild.innerText;
            }
            document.getElementById('text_area').style.borderColor = '#404040';
        }
        document.getElementById('cities').style.display = 'none';
    }

    var error = false;
    $('#text_area').focusout(function(){
        window.setTimeout(function() {blockFocusout();}, 200);
    });

    $('#text_area').focus(function(){
        document.getElementById('text_area').style.borderColor = '#5199db';
        document.getElementById('error').style.display = 'none';
    });

    $('#text_area').hover(function(){
        document.getElementById('text_area').style.borderColor = '#a2a2a2';
    }, function(){
        if(error){
            document.getElementById('text_area').style.borderColor = "#f00";
        } else {
            document.getElementById('text_area').style.borderColor = '#404040';
        }
    });
});