<?php
	session_start();
	header("Content-type: application/json");
	
	error_reporting(0);
	ini_set("display_errors", "off");
	
	require_once 'Db.class.php';
	require_once 'SmartDb.class.php'; 
	
	if(isset($_POST["doLogin"])){
		if( ! mysql_connect($_POST["host"], $_POST["username"], $_POST["password"])){
			echo '{"success":false, "errorMsg":"' . mysql_error() .  '"}';
			unset($_SESSION["smaAdmin"]);
			exit;
		} else {
			echo '{"success":true}';
			$_SESSION["smaAdmin"] = true;
			$_SESSION["host"] = $_POST["host"];
			$_SESSION["username"] = $_POST["username"];
			$_SESSION["password"] =  $_POST["password"];
			exit;
		}
	} else if($_SESSION["smaAdmin"] === true){
		$smartDb = new SmartDb(new Db($_SESSION["host"], $_SESSION["username"], $_SESSION["password"]));
	} else {
		exit;
	}

	$action = $_POST['action'];
	
	switch($action){
		case "getDatabasesAndTables":
			echo $smartDb->getDatabasesAndTables();
			break;
		
		case "getDbServerInfo":
			echo $smartDb->getDbServerInfo();
			break;
			
		case "initTabs":
			$initSql = $_POST["initSql"];
			echo $smartDb->getTable($initSql, true, null);
			break;
			
		case "getDbTables":
			$db = $_POST["db"];
			echo $smartDb->getDbTables($db);
			break;
			
		case "getTableStructure":
			$db = $_POST["db"];
			$table = $_POST["table"];
			echo $smartDb->getTable("SHOW COLUMNS FROM $table", true, $db);
			break;
			
		case "runRawSql":
			$db = $_POST["db"] === "null" ? null : $_POST["db"];
			$rawSql = isset($_POST["rawSql"]) ? $_POST["rawSql"] : null;
			$fields = (boolean)$_POST["fields"];
			$getNumRows = (boolean)$_POST["getNumRows"];
			$table = isset($_POST["table"]) ? $_POST["table"] : null;
			$start = isset($_POST["start"]) ? $_POST["start"] : null;
			$perPage = isset($_POST["perPage"]) ? $_POST["perPage"] : null;
			$orderField = $_POST["orderField"] !== "" ? $_POST["orderField"] : null;
			$orderBy = isset($_POST["orderBy"]) !== "" ? $_POST["orderBy"] : null;
			$delimiter = isset($_POST["delimiter"]) !== "" ? $_POST["delimiter"] : null;
			echo $smartDb->getTable($rawSql, $fields, $db, $table, $start, $perPage, $orderField, $orderBy, $getNumRows, $delimiter);
			break;
	}
	//End Of SmartDb Class