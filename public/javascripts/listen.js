
var subscribe = function (elt){
    var socket = io.connect('http://localhost:4242/ns');
    socket.on('connect', function (data) {
        console.log(data);
    });
    socket.on('message', function (data) {
        console.log(data);
        $("#content").append(data);
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
