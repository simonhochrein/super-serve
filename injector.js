io().on('server_refresh',function(data){
	var path1 = location.pathname;
	var isIndex = (location.pathname.lastIndexOf('/')+1 == location.pathname.length);

	var p1 = data.url.substring(0,data.url.lastIndexOf('/'));
	var p2 = location.pathname.substring(0,location.pathname.lastIndexOf('/'))
	if(p1==p2){
		location.reload();
	}
})