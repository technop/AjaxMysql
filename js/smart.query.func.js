	/**
	 * Gets Databases, Tables and Creates Database Navigation Menu
	 * 
	 * @param void
	 * @return void
	 */
	function getDbAndTableNavBar(SMA){
		SMA.StatusTools.AjaxLoader.display();
		$.ajax({
			data: {action:"getDatabasesAndTables"},
			success : function(resJson){
				if(resJson.success === false){
					SMA.StatusTools.MessageManager.saveMsg(resJson.errorMsg).displayMsg("error");
				} else {
					SMA.StatusTools.MessageManager.hideMsg();
					//database and table navigation
					var nav = "<ul id='databases'>";
					for(var p in resJson.databasesAndTables){
						nav += "<li class='database'>" + p + "</li>";
						nav += "<li>"
						nav += "<ul id='tables'>";
						for(var i in resJson.databasesAndTables[p]){
							nav += "<li class='table'>" + resJson.databasesAndTables[p][i] + "</li>";
						}
						nav += "</ul>";
						nav += "</li>";
					}
					nav += "</ul>";
											
					$("#db-table-nav").html(nav);
				}
				SMA.StatusTools.AjaxLoader.hide();
			}
		});
	}
	
	/**
	 * Gets Db Server Info and Creates Db Creating Menu
	 * 
	 * @param void
	 * @return void
	 */
	function getDbServerInfo(SMA){
		$.ajax({
			data : {action:"getDbServerInfo"},
			success : function(resJson){
				if (resJson.success === false) {
					SMA.StatusTools.MessageManager.saveMsg(resJson.errorMsg).displayMsg("error");
				} else {
					SMA.StatusTools.MessageManager.hideMsg();
					var dbInfoTable = "<table id='db-info-table'>";
					dbInfoTable += "<thead><th colspan='2'>MySQL Server Information</th></thead>";
					dbInfoTable += "<tbody><tr><td><strong>Host</strong></td> <td>" + resJson.serverInfo.host + "</td></tr>";
					dbInfoTable += "<tr><td><strong>Server</strong></td> <td>" + resJson.serverInfo.server + "</td></tr>";
					dbInfoTable += "<tr><td><strong>Protocol</strong></td> <td>" + resJson.serverInfo.protocol + "</td></tr>";
					dbInfoTable += "<tr><td><strong>Client Library</strong></td> <td>" + resJson.serverInfo.client + "</td></tr>";
					dbInfoTable += "<tr><td><strong>Web Server</strong></td> <td>" + resJson.serverInfo.webServer + "</td></tr>";
					dbInfoTable += "<tr><td><strong>Uptime</strong></td> <td>" + resJson.serverInfo.uptime + "</td></tr>";
					dbInfoTable += "</tbody></table>";
					
					var collTable = "<table id='create-new-db-table'>";
					collTable += "<thead><th colspan='2'>Create New Database</th></thead>";
					collTable += "<tbody><tr><td><strong>Name :</strong> <input id='create-db-input' type='text' size='20' /></td>";
					collTable += "<td><strong>Collation : </strong><select id='collation-select'><option value=''>Collation</option>";
					for(var i in resJson.serverInfo.collations){
						collTable += "<option value='" + resJson.serverInfo.collations[i]["CHARACTER_SET_NAME"] +  "'>" + resJson.serverInfo.collations[i]["COLLATION_NAME"] + "</option>";
					}
					collTable += "</select></td></tr><tr><td colspan='2' style='text-align:right;'><input id='create-db-button' class='button' type='button' value='Create' /></td></tr></tbody></table>";
					dbInfoTable += collTable;
					
					var dbsTable = "<table id='drop-db-table'>";
					dbsTable += "<thead><th>Databases</th><th>Drop</th></thead><tbody>";
					for(var i in resJson.serverInfo.databases){
						if(resJson.serverInfo.databases[i]["Database"] === "mysql"||resJson.serverInfo.databases[i]["Database"] === "information_schema"){
							dbsTable += "<tr><td><strong>" + resJson.serverInfo.databases[i]["Database"] + "<strong></td><td></td></tr>";
						} else {
							dbsTable += "<tr><td><strong>" + resJson.serverInfo.databases[i]["Database"] + "<strong></td><td class='action-drop-db action'><img src='img/action-browse-delete.png' alt='Drop Db' title='Drop Db'/></td></tr>";
						}
					}
					dbsTable += "</tbody><table>";
					dbInfoTable += dbsTable;
					$("#db-info-tab").html(dbInfoTable);
				}			
			}
		});
	}
	
	function getDbTables(SMA){
		if (SMA.StatusTools.DbTableManager.getDb() === null) {
			SMA.StatusTools.MessageManager.saveMsg("No Database Selected").displayMsg("error");
		} else {
			SMA.StatusTools.AjaxLoader.display();
			$.ajax({
				data: {
					action : "getDbTables",
					db : SMA.StatusTools.DbTableManager.getDb()
				},
				success: function(resJson){
					if (resJson.success === false) {
						SMA.StatusTools.MessageManager.saveMsg(resJson.errorMsg).displayMsg("error");
					} else {
						SMA.StatusTools.MessageManager.hideMsg();
						//rebuild table with new headers and table actions
						resJson.table.addHeaderCell = "<th>Browse</th> <th>Structure</th> <th>Empty</th> <th>Drop</th>";
						resJson.table.addBodyCell = "<td class='action-tables-browse action' title='Browse'><img src='img/action-browse.png' alt='browse' title='Browse'/></td>"
							+ "<td class='action-tables-structure action' title='Structure'><img src='img/action-browse1.png' alt='Structure' title='Structure'/></td>"
							+ "<td class='action-tables-truncate action' title='Empty'><img src='img/action-empty.png' alt='Empty' title='Empty'/></td>"
							+ "<td class='action-tables-drop action' title='Drop'><img src='img/action-delete.png' alt='Drop' title='Drop'/></td>"
						var table = createTable(null, null, resJson.table, resJson.table, null, null);
						$("#tables-tab").html(table);
					}
					SMA.StatusTools.AjaxLoader.hide();
				}
			});
		}
	}
	
	function getTableStructure(SMA){
		if (SMA.StatusTools.DbTableManager.getDb() === null) {
			SMA.StatusTools.MessageManager.saveMsg("No Database Selected").displayMsg("error");
			$("#structure-tab").html("");
		} else if (SMA.StatusTools.DbTableManager.getTable() === null || SMA.StatusTools.DbTableManager.getTable() === "") {
			SMA.StatusTools.MessageManager.saveMsg("No Table Selected").displayMsg("error");
			$("#structure-tab").html("");
		} else {
			SMA.StatusTools.AjaxLoader.display();
			$.ajax({
				data: {
					action: "getTableStructure",
					db: SMA.StatusTools.DbTableManager.getDb(),
					table: SMA.StatusTools.DbTableManager.getTable()
				},
				success: function(resJson){
					//	alert(JSON.stringify(resJson));
					if (resJson.success === false) {
						SMA.StatusTools.MessageManager.saveMsg(resJson.errorMsg);
						SMA.StatusTools.MessageManager.displayMsg("error");
					} else {
						SMA.StatusTools.MessageManager.hideMsg();
						var table = createTable(null, null, resJson.table, resJson.table, null, null);
						$("#structure-tab").html(table);
					}
					SMA.StatusTools.AjaxLoader.hide();
				}
			});
		}
	}
	
	function runRawSql(SMA, options){
		SMA.StatusTools.AjaxLoader.display();
		$.ajax({
			data : options.postData,
			success : function(resJson){
				//	alert(JSON.stringify(resJson));
				if (resJson.success === false) {
					SMA.StatusTools.MessageManager.saveMsg(resJson.errorMsg).displayMsg("error");
					$("#raw-sql-browser").html("");
				} else {
					SMA.StatusTools.MessageManager.saveMsg(SMA.StatusTools.MessageManager.createSuccessQueryMsg(resJson.table)).displayMsg("success");
					var table = "";
					//used for creating dbTables(column.substr(0,70))
					resJson.table.dbTableRow = true;
					if(options.browser === "#table-browser" && options.getPager === true && options.getNumRows !== 0){
						//sort
						SMA.QueryManager.Browse.sortField = "";
						SMA.QueryManager.Browse.sortBy = "";
						//init pager
						SMA.PagerManager.Browse.numRows = resJson.table.numRows;
						SMA.PagerManager.Browse.getPager((options.postData.start / SMA.PagerManager.Browse.perPage) + 1);
						//init table header for once and use for every page
						SMA.QueryManager.Browse.fields = resJson.table.fields;
						SMA.QueryManager.Browse.prependHeaderCell = "<th><input id='action-browse-check-all-rows' type='checkbox'></th>";
						SMA.QueryManager.Browse.addHeaderCell = "<th>Edit</th> <th>Delete</th>";
						//init edit manager
						SMA.EditManager.Row.columnInfo = resJson.table.columnInfo;
						SMA.EditManager.Row.rows = resJson.table.rows;
						//prepend new body cells
						resJson.table.prependBodyCell = "<td  class='action'><input class='action-browse-check-row' type='checkbox'></td>";
						//add new body cells
						resJson.table.addBodyCell = "<td class='action-browse-edit action'><img src='img/action-browse-edit.png' alt='Edit' title='Empty'/></td>"
							+ "<td class='action-browse-delete action'><img src='img/action-browse-delete.png' alt='Delete' title='Delete'/></td>"
						//create table
						table = createTable(null, null, SMA.QueryManager.Browse, resJson.table, null, null);
					} else if(options.browser === "#table-browser" && options.getPager === false){
						//sort
						if(typeof options.sortField !== ""){
							SMA.QueryManager.Browse.sortField = options.sortField;
							SMA.QueryManager.Browse.sortBy = options.sortBy;
						}
						//set new rows for editing rows						
						SMA.EditManager.Row.rows = resJson.table.rows;
						//prepend new body cells
						resJson.table.prependBodyCell = "<td class='action'><input class='action-browse-check-row' type='checkbox'></td>";
						//add new body cells
						resJson.table.addBodyCell = "<td class='action-browse-edit action'><img src='img/action-browse-edit.png' alt='Edit' title='Empty'/></td>"
							+ "<td class='action-browse-delete action'><img src='img/action-browse-delete.png' alt='Delete' title='Delete'/></td>"
						//create table by using saved header options
						table = createTable(null, null, SMA.QueryManager.Browse, resJson.table, null, null);		
					} else if(options.browser === "#raw-sql-browser" && options.getPager === true && options.getNumRows !== 0){
						SMA.QueryManager.RawSql.sortField = "";
						SMA.QueryManager.RawSql.sortBy = "";
						SMA.PagerManager.RawSql.numRows = resJson.table.numRows;
						SMA.QueryManager.RawSql.tableHeader = resJson.table.fields;
						if(options.select === true){
							SMA.PagerManager.RawSql.getPager(1);
						}
						SMA.QueryManager.RawSql.fields = resJson.table.fields;
						table = createTable(null, null, resJson.table, resJson.table, null, null);
					} else if(options.browser === "#raw-sql-browser" && options.getPager === false){
						//sort
						if(typeof options.sortField !== ""){
							SMA.QueryManager.RawSql.sortField = options.sortField;
							SMA.QueryManager.RawSql.sortBy = options.sortBy;
						}
						table = createTable(null, null, SMA.QueryManager.RawSql, resJson.table, null, null);
					} else {
						table = createTable(null, null, resJson.table, resJson.table, null, null);							
					}			
					$(options.browser).html(table);
				}
				SMA.StatusTools.AjaxLoader.hide();
			}
		});
	}
	
	function getTableRows(SMA, page){
		var options = {};
		options.browser = "#table-browser";
		options.getPager = true;
		var postData = {
			action: "runRawSql",
			db : SMA.StatusTools.DbTableManager.getDb(),
			table : SMA.StatusTools.DbTableManager.getTable(),
			fields : 1,
			orderField : SMA.QueryManager.Browse.orderField,
			orderBy : SMA.QueryManager.Browse.orderBy,
			start : (page-1) * (SMA.PagerManager.Browse.perPage),
			perPage : SMA.PagerManager.Browse.perPage,
			getNumRows : 1,
			delimiter: $("#delimiter").val()
		};
		
		options.postData = postData;
		runRawSql(SMA, options);
	}