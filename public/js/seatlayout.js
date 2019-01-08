window.onload = onLoadFunc();

var arr = [];
var i=0;

var map = {};
var k;
for(k=0; k<358; k++){
    map[k]=0;
}

function onLoadFunc(){
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
                    $('.'+childSnapshot.key).css({"background":"blue"});
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
        arr[i]= text;
        //window.alert(arr[i]);
        i = i+1;
        if(map[text]===0){
            map[text]=1;
        }else{
            map[text]=0;
        }
    }
});

function updateDB(){
    var arrResult = [];
    var uid = firebase.database().ref('Movies/').orderByChild('date');
    uid.on('value',function(snapshot){
        snapshot.forEach(childSnapshot => {
            arrResult.push(childSnapshot.key);
            //window.alert(childSnapshot.key);
        });
        // var j;
        // for(j=0; j<arr.length; j++){
        //     firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+arr[j]).set("R");
        // }
        var j;
        for(j=0; j<358; j++){
            if(map[j]===1){
                firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+j).set("R");
            }
        }
    });
}




