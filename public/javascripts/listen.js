
var subscribe = function (elt){
    var socket = io.connect('http://localhost/ns');
    socket.on('connect', function (data) {
        //console.log(data);
    });
    socket.on('message', function (data) { 
        //console.log(data);
        var c = JSON.stringify(data)
        var d = JSON.parse(data)
        var l = data.length;
        var unit = "o"
        if (l/1024 > 1){
          l = parseInt(l/1024);
          unit = "Ko"
        }
        var div = "<tr><td>"+d.channel+"</td><td>"+l+unit+"</td></tr>";
        $("#push").append(div);
        $("#content").each( function() 
        {
           // certain browsers have a bug such that scrollHeight is too small
           // when content does not fill the client area of the element
           var scrollHeight = Math.max(this.scrollHeight, this.clientHeight);
           this.scrollTop = scrollHeight - this.clientHeight;
        });
    });
//    var data = {client:app.ClientId, key: app.secretkey , app:app.id,channel:ch,url:"http://search.twitter.com/search.json?q=sex&rpp=5&include_entities=true&result_type=recent",ttl:3};
    console.log(elt)
    socket.emit('psubscribe', elt);      
}
