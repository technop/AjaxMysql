$(function(){	
	$('#do_login').bind("click", function(e){
		var host = $("#host").val();
		var username = $('#username').val();
		var password = $('#password').val();
		
		$.ajax({	
			dataType: "json",
			type: "POST",
			url: "engine.php",
			data : 'doLogin=true&host=' + host + '&username=' + username + '&password=' + password,
			success : function(data){
				if(data.success !== false){				
					window.location.href = 'index.php';
				} else {
					$('#errorMsg').text(data.errorMsg).slideDown('slow');
				}
			}
		});
	});
});
