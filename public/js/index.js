window.onload = onLoadFunc();

var count1 = 0;
var count2 = 0;
var user = "A-011";
var map = {};
var m;
var arr1=[];
var k;
var h=0;
for(k=0; k<358; k++){
    map[k]=0;
}

function onLoadFunc(){
    $('p').css('opacity','0');
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
                    $('.'+childSnapshot.key).css({"background-color":"#E98074"});
                    // $('.'+childSnapshot.key).css({"background":"white"});
                }
            });
        });
    });
}

$('.seat').on('click', function() {
    var color = $(this).css("background");
    if($(this).css("background")=="rgb(233, 128, 116) none repeat scroll 0% 0% / auto padding-box border-box"){
        window.alert("already selected");
    }else{
        var text = $(this).attr('id');
        // alert(text);
        if(map[text]===0){
            map[text]=1;
            $(this).css({"background":"#8E8D8A"});
            count1 = count1 + 1;
        }else{
            map[text]=0;
            $(this).css({"background":"rgb(222, 228, 228)"});
            count1 = count1 - 1;
        }
    }
});

// function updateDB(){
//     var arrResult = [];
//     var uid = firebase.database().ref('Movies/').orderByChild('date');
//     uid.on('value',function(snapshot){
//         snapshot.forEach(childSnapshot => {
//             arrResult.push(childSnapshot.key);
//         });        
//     });
//     var j;
//     for(j=0; j<358; j++){
//         if(map[j]===1){
//             var def = firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+j);
//             def.once('value',function(snapshot){
//                 if(snapshot.val()==="A"){
//                     arr1[h]=j;
//                     h++;
//                     count2 = count2 + 1;
//                 }
//             });
//         }
//     }
//     // window.alert(count1);
//     // window.alert(count2);
//     if(count2<count1){
//         window.alert('seat already booked you are late');
//     }
//     if(count2==count1){
//         for(m=0; m<h; m++){
//             var xx = firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+arr1[m]);
//             xx.once('value',function(snapshot){
//                 if(snapshot.val()==="A"){
//                     firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+arr1[m]).set("R");
//                     alert('success');
//                 }else{
//                     alert('you are late 2');
//                 }
//             });
//         }
//     }
// }


function updateDB(){
    var d = new Date();
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
            def.once('value',function(snapshot){
                //alert(1);
                if(snapshot.val()==="A"){
                    count2 = count2 + 1;
                  //  alert(2);
                }else{
                    //alert(3);
                }
            });
        }
    }

    if(count2<count1){
        window.alert('seat already booked you are late');
    }
    if(count2==count1){
        for(j=0; j<358; j++){
            if(map[j]===1){
                firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/'+j).set("R");
                //alert(firebase.database().ref('Movies/'+arrResult[0]+'/hall/status/').child(j).val());
            }
        }
        window.alert('success');
    }
}



