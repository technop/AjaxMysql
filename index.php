<?php
session_start();
	if(! isset($_SESSION["smaAdmin"])){
		echo "<a href='login.php'>Please Login</a>";
		exit;
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	
	<!-- 
		smartMySQLAdmin v0.1.1 beta - Ajax Based MySQL Admin
		Copyright (c) 2009 Yasin DAĞLI
		License : GPLv3
 	-->
	
	<title>smartMySQLAdmin</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	
	<meta http-equiv="expires" content="0" />
	<meta http-equiv="expires" content="Tue, 14 Mar 2000 12:45:26 GMT" />
	<meta http-equiv="pragma" content="no-cache" />
	<meta http-equiv="cache-control" content="no-cache, must-revalidate" />
	
	<link rel="stylesheet" href="css/frame.css" type="text/css" media="screen" charset="utf-8" />
	<link rel="stylesheet" href="css/jq.ui.css" type="text/css" media="screen" charset="utf-8" />
		
	<script type="text/javascript" src="js/jquery.1.3.2.js"></script>
	<script type="text/javascript" src="js/ui.core.js"></script>
	<script type="text/javascript" src="js/ui.tabs.js"></script>
	<script type="text/javascript" src="js/ui.draggable.js"></script>
	<script type="text/javascript" src="js/smart.pager.js"></script>
	<script type="text/javascript" src="js/smart.tableCreator.js"></script>
	<script type="text/javascript" src="js/smart.query.func.js"></script>
	<script type="text/javascript" src="js/smartmysqladmin.js"></script>

</head>

<body>

	<!--START: wrapper-->
	<div id="wrapper" class="clearfix">
		
		<!--START: status-->	
		<div id="status" class="clearfix">
			<div id="status-top">
				<div id="smartMysqlAdminLogo"><a href="http://www.smartphpcalendar.com/smartmysqladmin/">smartMySQLAdmin</a></div>
				<div id="global_db_table">
					<span id="global_db">no db selected</span> > <span id="global_table">no table selected</span>
				</div>
				<img id="refresh" src="img/refresh.png" alt="Refresh" title="Refresh" /><img id="logout" src="img/logout.png" alt="Logout" title="Logout"/></div>
			
			<div id="messageBar"><span id="statusMsg"></span></div>
		
		</div>
		<!--END: status-->
		
		<!--START: content-left-->
		<div id="content-left">
			<h1>Databases</h1>
			<hr />
			<!-- database > tables navigation -->
			<div id="db-table-nav"></div>
		</div>
		<!--END: content-left -->
		
		<!--START: content-right -->
		<div id="content-right">

			<!--START: Tabs-->
			<div id="tabs">
				
			    <ul>
			        <li><a href="#database-tab" class="database_tab"><span>Database</span></a></li>
					<li><a href="#tables-tab" class="tables_tab"><span>Tables</span></a></li>
					<li><a href="#structure-tab" class="structure_tab"><span>Structure</span></a></li>
			        <li><a href="#browse-tab" class="browse_tab"><span>Browse</span></a></li>
			        <li><a href="#sql-tab" class="sql_tab"><span>Sql</span></a></li>
					<li><img id="ajax_loader" src="img/ajax_loader.gif" alt="loading" /></li>
			    </ul>
				
			    <div id="database-tab">
			    	
					<!--START: sub-database-tab -->				
					<div id="sub-database-tab">
						
						 <ul>
					        <li><a href="#db-info-tab" class="db_info_tab"><span>Db Info</span></a></li>
							<li><a href="#variables-tab" class="variables_tab"><span>Variables</span></a></li>
							<li><a href="#engines-tab" class="engines_tab"><span>Engines</span></a></li>
							<li><a href="#charsets-tab" class="charsets_tab"><span>Charsets - Collations</span></a></li>
							<li><a href="#processes-tab" class="processes_tab"><span>Processes</span></a></li>
					    </ul>
						
						<div id="db-info-tab"></div>
						<div id="status-tab"></div>
						<div id="variables-tab"></div>
						<div id="engines-tab"></div>
						<div id="charsets-tab"></div>
						<div id="processes-tab"></div>
						
					</div>
					<!--END: sub_database_tab -->

			    </div>
				
				<div id="tables-tab">

			    </div>
				
				<div id="structure-tab">

			    </div>
				
				<div id="browse-tab">
					
					<div id="browse-button-group">
						<input id="action-browse-delete-button" class="button" type="button" value="Delete" />
						<input id="action-browse-insert-row-button" class="button" type="button" value="Insert" />
					</div>  
					
					<!-- table browser -->
					<div id="table-browser"></div>
				
					<!-- pager -->
					<div class="pager">
						<div class="pages"></div>
						<input type="button" id="show" class="button" value="Show" /> <input type="text" class="per-page" value="10" size="3" style="direction:rtl;"/> Rows per page
					</div>
					
					<!-- edit-row-dialog -->
					<div id="edit-row-dialog"><div id="edit-row-dialog-handle">Edit Row <a class="dialog-closer" href="#">(x)</a></div><div id="edit-row-dialog-content"></div><input class="button" id="action-save-row-button" type="button" value="Save" /></div>
					<!-- insert-row-dialog -->
					<div id="insert-row-dialog"><div id="insert-row-dialog-handle">Insert Row <a class="dialog-closer" href="#">(x)</a></div><div id="insert-row-dialog-content"></div><input class="button" id="action-insert-row-button" type="button" value="Insert" /></div>
			    </div>
				
				<div id="sql-tab">
					
					<table id="raw-sql-table">
						<tr><td><textarea type="text" id="raw_sql_input" name="raw_sql_input"></textarea> </td><td><input class="button" id="run_button" type="button" name="run_button" value="Run"/></td></tr>
						<tr><td colspan="2">Delimiter <input type="text" id="delimiter" name="delimiter" value=";" size="3"/></td></tr>
					</table>
					
					<!-- raw-sql-browser -->
					<div id="raw-sql-browser"></div>
					
					<!-- pager -->
					<div class="pager">
						<div class="pages"></div>
					</div>
			    </div>
				
			</div>
			<!--END: Tabs-->
			
		</div>	
		<!--END: content-right -->

	</div>
	<!--END: wrapper -->
	
</body>
</html>