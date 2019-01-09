window.onload = onLoadFunc();

var count1 = 0;
var count2 = 0;
var user = "A-011";
var map = {};
var k;
for(k=0; k<358; k++){
    map[k]=0;
}

function onLoadFunc(){
    
    var x;
    for(x=0; x<358; x++){
        $("."+x).css('pointer-events', 'none');
    }
    var arrResult = [];
    var uid = firebase.database().ref('Movies/').orderByChild('date');
    uid.on('value',function(snapshot){
        snapshot.forEach(childSnapshot => {
            arrResult.push(childSnapshot.key);
        });
        var def = firebase.database().ref('Movies/'+arrResult[0]+'/hall/status');
        def.on('value',function(snapshot){
            snapshot.forEach(childSnapshot=>{
                if(childSnapshot.val()==="R"){
                    $('.'+childSnapshot.key).css({"background":"#FFA500"});
                    $('.'+childSnapshot.key).css('pointer-events', 'none');
                }else{
                    $('.'+childSnapshot.key).css('pointer-events', 'auto');
                }
            });
        });
    });
}


$('.cinema-seats .seat').on('click', function() {
    var color = $(this).css("background");
    if($(this).css("background")=="rgb(0, 0, 255) none repeat scroll 0% 0% / auto padding-box border-box"){
        window.alert("already selected");
    }else{
        $(this).toggleClass('active');
        var text = $(this).text();
        if(map[text]===0){
            map[text]=1;
            count1 = count1 + 1;
        }else{
            map[text]=0;
            count1 = count1 - 1;
        }
    }
});

function updateDB(){
    var arrResult = [];
    var uid = firebase.database().ref('Movies/').orderByChild('date');
    uid.on('value',function(snapshot){
        snapshot.forEach(childSnapshot => {
            arrResult.push(childSnapshot.key);
        });        
    });
    var j;
    for(j=0; j<358; j++){
        if(map[j]===1){
            var def = firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+j);
            def.on('value',function(snapshot){
                if(snapshot.val()==="A"){
                    count2 = count2 + 1;
                }
            });
        }
    }
    // window.alert(count1);
    // window.alert(count2);
    if(count2<count1){
        window.alert('seat already booked you are late');
    }
    if(count2===count1){
        for(j=0; j<358; j++){
            if(map[j]===1){
                firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+j).set("R");
            }
        }
        window.alert('success');
    }
}