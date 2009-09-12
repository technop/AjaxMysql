<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>smartMySQLAdmin - Login</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="-1">
<script type="text/javascript" src="js/jquery.1.3.2.js"></script>
<script type="text/javascript" src="js/login.js"></script>

<style type="text/css">

	*
	{
		margin:0;
		padding:0;
		font-family:sans-serif, Verdana;
		font-size:12px;
		font-weight:bold;
	}
	body
	{
		text-align:center;
	}
	img
	{
		border:0;
	}
	.header1
	{
		font-size:14px;
		font-weight:bold;
	}
	#container
	{
		margin-left:auto;
		margin-right:auto;
		position:relative;
		height:300px;
		top:170px;
		width:600px;
		padding:50px;
		height:auto;
		border:1px dashed silver;
	}
	.center
	{
		margin:0 auto;
	}
	input
	{
		border: 1px solid silver;
		width:220px;
		padding:5px 0;
		font-size:13px;
	}
	#errorMsg
	{
		text-align:left;
		border:1px dashed red;
		text-align:center;
		display:none;
		margin:10px 0;
		padding:5px;
		color:red;
		background-color:#ffd1d9;
	}

</style>

</head>

<body>
	
	<div id="container">
				
		<div clas="center" id="errorMsg"></div>
		<table class="center" cellspacing="10">
			<caption><h1 class="header1">smartMySQLAdmin - User Login</h1></caption>
			<tr> <td>host : </td> <td> <input id="host" type="text"/> </td> </tr>
			<tr> <td>username : </td> <td> <input id="username" type="text"/> </td> </tr>
			<tr> <td>password : </td> <td> <input id="password" type="password"/> </td> </tr>
			<tr> <td style="text-align:right;" colspan="2"><input type="button" id="do_login" value="Login" /></td></tr>
		</table>
		
	</div>
</body>
</hmtl>