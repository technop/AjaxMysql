	/**
	 * smartMySQLAdmin v0.1.1 beta
	 * http://www.smartphpcalendar.com/smartmysqladmin
	 * 
	 * Copyright (c) 2009 Yasin DAĞLI
	 * Licensed under GPL license:
	 * http://www.gnu.org/licenses/gpl.html
	 */
	$(document).ready(function(){
		
		//tabs
		var $tabs = $('#tabs').tabs();
		var $sub_database_tabs = $('#sub-database-tab').tabs();
		$("#edit-row-dialog").draggable({ handle: "#edit-row-dialog-handle"});
		$("#insert-row-dialog").draggable({ handle: "#insert-row-dialog-handle"});
		
		//jQuery Ajax Setup
		$.ajaxSetup({
			type: "post",
			url: "engine.php",
			dataType: "json",
			cache: true,
			error: function(xhr, textStatus, e){
				var errorMsg = "An error occured. <strong>xhr.statusText:</strong> " + xhr.statusText
				+ " <br /> <strong>xhr.responseText:</strong> " + xhr.responseText
				+ " <br /> <strong>textStatus:</strong> " + textStatus
				+ " <br /> <strong>exception:</strong> " + e;
				SMA.StatusTools.MessageManager.saveMsg(errorMsg).displayMsg("error");
			}
		});
		
		/**
		 * smartMysqlAdmin Namespace
		 */
		var SMA = {};
		SMA.VERSION = "0.1.1";
		
		/**
		 * Status Tools - Global Db > Table Navigation Manager - Global Message Manager
		 */
		SMA.StatusTools = {};
		
		SMA.StatusTools.DbTableManager = function(){
			var db = null;
			var table = null;
			return {
				setDb: function(d){
					db = d;
					$("#global_db").text(d);
				},
				setTable: function(t){
					table = t;
					$("#global_table").text(t);
				},
				getDb: function(){
					return db;
				},
				getTable: function(){
					return table;
				}
			}
		}();
		
		SMA.StatusTools.MessageManager = function(){
			var msg = "";
			return {
				saveMsg: function(m){
					msg = m;
					$("#statusMsg").html(m);
					return this;
				},
				createSuccessQueryMsg: function(resJson){
					var successMsg = "";
					if (typeof resJson.affectedRows !== "undefined") {
						successMsg += "Query Successfully Executed.";
						if (resJson.affectedRows > 1) {
							successMsg += resJson.affectedRows + " rows affected ";
						} else {
							successMsg += resJson.affectedRows + " row affected ";
						}
					} else if(resJson.numRows !== false){
						if (resJson.numRows > 1) {
							successMsg += resJson.numRows + " rows in set ";
						} else {
							successMsg += resJson.numRows + " row in set ";
						}
					}
					successMsg += "<" + resJson.queryTime + " sec>";
					return successMsg;
				},
				displayMsg: function(msgType){
					if (msgType === "error") {
						$("#messageBar").css({
							"background-color": "#ffcccc",
							"border": "1px dashed red"
						});
					}else if (msgType === "success") {
							$("#messageBar").css({
								"background-color": "#fffdcc",
								"border": "1px dashed #ffe147"
							});
						}
					$("#messageBar").slideDown("slow");
				},
				hideMsg: function(){
					$("#messageBar").slideUp("slow");
				}
			};
		}();
		
		SMA.StatusTools.AjaxLoader = function(){
			return {
				display: function(){
					$('#ajax_loader').css("visibility", "visible");
				},
				hide: function(){
					$('#ajax_loader').css("visibility", "hidden");
				}
			}
		}();
		
		/**
		 * Query Manager
		 * Manages Query Browser Queries and Browse Tab Queries
		 */
		SMA.QueryManager = {};
		
		SMA.QueryManager.RawSql = {
			rawSql: "",
			orderField: "",
			orderBy: "ASC",
			limit: false,
			fields: [],
			reset: function(){
				this.orderField = "";
				this.orderBy = "";
			},
			options: {
				browser: "#raw-sql-browser",
				getPager: false,
				select: false,
				postData: {
						action: "runRawSql",
						db: SMA.StatusTools.DbTableManager.getDb(),
						rawSql: "",
						fields: 0,
						orderField: "",
						orderBy: "",
						getNumRows: 0,
						delimiter: $("#delimiter").val()
					}
			}
		};
		
		SMA.QueryManager.Browse = {
			orderField: "",
			orderBy: "ASC",
			fields: [],
			reset: function(){
				this.orderField = "";
				this.orderBy = "";
			}
		}
		
		/**
		 * Browse Tab and QueryBrowser Pager Manger
		 */
		SMA.PagerManager = {};
		
		SMA.PagerManager.Browse = {
			pager: new Pager(),
			currentPage: 1,
			numRows: 0,
			start: 0,
			perPage:  Number($("#browse-tab").find(".per-page").val()),
			getPager: function(page){
				var bound = Math.ceil(this.numRows/this.perPage);
				this.pager.setBound(bound);
				$("#browse-tab").find(".pages").html(this.pager.getLinks(page));
			}
		};
		
		SMA.PagerManager.RawSql = {
			pager: new Pager(),
			currentPage: 1,
			numRows: 0,
			start: 0,
			perPage: Number($("#browse-tab").find(".per-page").val()),
			getPager: function(page){
				var bound = Math.ceil(this.numRows/this.perPage);
				this.pager.setBound(bound);
				$("#sql-tab").find(".pages").html(this.pager.getLinks(page));
			}
		};
		
		/**
		 * Edit Manager - Manages Row, [Table] and Database Editing Operations
		 */
		SMA.EditManager = {};
		
		SMA.EditManager.Row = {
			//column names, types, etc.
			columnInfo: [],
			rows: [],
			currentRow: 0,
			//display edit row dialog by using fetched row object | n == row number, used defining column value
			displayEditRowDialog: function(n){
				this.currentRow = n;
				var e = {};
				e.table = {};
				e.table.fields = ["Field", "Type", "Value"];		
				e.table.rows = [];		
				for(var i in this.columnInfo){
					var o = {};
					o.field = this.columnInfo[i]["Field"];
					o.type = this.columnInfo[i]["Type"];
					o.value = this.getEditRowInput(this.rows[n][this.columnInfo[i]["Field"]], this.columnInfo[i]["Field"], this.columnInfo[i]["Type"]);
					e.table.rows.push(o);
				}
				var table = createTable(null, null, e.table, e.table, null, null);
				$("#edit-row-dialog-content").html(table);
			},
			getEditRowInput: function(val, name, type){
				if(/text/ig.test(type) || /binary/ig.test(type) || /blob/ig.test(type)){
					return "<textarea style='width:220px; height:70px;' class='edit-row-input' name='" + name + "'>" + val + "</textarea>";
				} else {
					return "<input class='edit-row-input' type='text' name='" + name + "' value='" + val + "' />";
				}
			},
			displayInsertRowDialog: function(){
				var e = {};
				e.table = {};
				e.table.fields = ["Field", "Type", "Value"];
				e.table.rows = [];
				for(var i in this.columnInfo){
					var o = {};
					o.field = this.columnInfo[i]["Field"];
					o.type = this.columnInfo[i]["Type"];
					o.value = this.getInsertRowInput(this.columnInfo[i]["Field"], this.columnInfo[i]["Type"]);
					e.table.rows.push(o);
				}
				var table = createTable(null, null, e.table, e.table, null, null);
				$("#insert-row-dialog-content").html(table);
			},
			getInsertRowInput: function(name, type){
				if(/text/i.test(type) || /binary/i.test(type) || /blob/i.test(type)){
					return "<textarea style='width:220px; height:70px;' class='insert-row-input' name='" + name + "'></textarea>";
				} else {
					return "<input class='insert-row-input' type='text' name='" + name + "' value=''/>";
				}
			},
			//checks if table has a primary key | used for update|delete rows
			checkPK : function(){
				for(var i in this.columnInfo){
					for(var p in this.columnInfo[i]){
						if(this.columnInfo[i][p] === "PRI"){
							return this.columnInfo[i]["Field"];
						}
					}
				}
				return false;
			},
			getUpdateSql: function(){
				var sql = "UPDATE " + SMA.StatusTools.DbTableManager.getTable() + " SET ";
						
				$(".edit-row-input").each(function(i,v){
	 				sql += $(this).attr("name") + "='" + $(this).val() + "',";
				});
				//clean last comma
				sql = sql.substr(0, (sql.length - 1));
				sql += " WHERE ";
				var pK = this.checkPK();
				if(pK !== false){
					sql += pK + "='" + this.rows[this.currentRow][pK] + "'";
				} else {
					for(var i in this.rows[this.currentRow]){
						sql += i + "='" + this.rows[this.currentRow][i] + "' AND ";
					}
					//clean last AND operator
					sql = sql.substr(0, (sql.length - 5));
				}
				sql += " LIMIT 1";
				
				return sql;
			},
			getDeleteSql: function(){
				var sql = "DELETE FROM " + SMA.StatusTools.DbTableManager.getTable() + " WHERE ";
				if(this.checkPK() !== false){
					sql += this.checkPK() + "='" + this.rows[this.currentRow][this.checkPK()] + "'";
				} else {
					for(var i in this.rows[this.currentRow]){
						sql += i + "='" + this.rows[this.currentRow][i] + "' AND ";
					}
					//clean last AND operator
					sql = sql.substr(0, (sql.length - 5));
				}
				sql += " LIMIT 1";

				return sql;
			},
			getInsertSql: function(){
				var sql = "INSERT INTO " + SMA.StatusTools.DbTableManager.getTable() + " VALUES(";
						
				$(".insert-row-input").each(function(i,v){
					if($(this).val()==""){
						sql += null + ",";
					} else {
						sql += "'" + $(this).val() + "',";
					}
				});
				//clean last comma
				sql = sql.substr(0, (sql.length - 1));
				sql += ")";

				return sql;
			},
			getCreateDbSql: function(){
				var sql = "CREATE DATABASE " + trim($("#create-db-input").val());
				var selectedCollation = $("#collation-select :selected");
				if(selectedCollation !== ""){
					sql += " DEFAULT CHARSET " + selectedCollation.val() + " COLLATE " + selectedCollation.text();
				}
				
				return sql;
			}
		};
		
		//initApp
		SMA.initApp = function(){
			function init(tab, sql){
				$.ajax({
					data : {
						action : "initTabs",
						initSql : sql	
					},
					success : function(resJson){
						var table = createTable(null, null, resJson.table, resJson.table, null, null);
						$(tab).html(table);
					}
				});
			}
			
			var initTabs = {
					"#variables-tab" : "SHOW VARIABLES",
					"#engines-tab" : "SHOW ENGINES",
					"#processes-tab" : "SHOW PROCESSLIST",
					"#charsets-tab" : "SELECT information_schema.COLLATIONS.COLLATION_NAME, "
						+ "information_schema.COLLATIONS.CHARACTER_SET_NAME, "
						+ "information_schema.CHARACTER_SETS.DESCRIPTION "
						+ "FROM information_schema.COLLATIONS "
						+ "INNER JOIN information_schema.CHARACTER_SETS "
						+ "ON(information_schema.COLLATIONS.CHARACTER_SET_NAME = information_schema.CHARACTER_SETS.CHARACTER_SET_NAME) "
						+ "ORDER BY information_schema.COLLATIONS.COLLATION_NAME"
				};
			
			getDbAndTableNavBar(SMA);
			getDbServerInfo(SMA);
			for(var i in initTabs){
				init(i, initTabs[i]);
			}
		};
		//init application
		SMA.initApp();

		//refresh SMA
		$("#refresh").bind("click", function(){
			SMA.initApp();
			var selected = $tabs.tabs("option", "selected");
			if(selected === 1){
				getDbTables(SMA);
			} else if(selected === 2){
				getTableStructure(SMA);
			} else if(selected === 3){
				getTableRows(SMA, 1);
			}
		});
		
		$(".database").live("click", function(){
			var dbName = $(this).text();
			SMA.StatusTools.DbTableManager.setDb(dbName);
			SMA.StatusTools.DbTableManager.setTable("");
			
			$("#table-browser").html("");
			
			$(this).next().children("#tables").slideToggle("fast");
			$(".database").each(function(){$(this).css("background-color","white")});
			
			$(".table").each(function(){$(this).css("background-color","white")});
			$(this).css({"background-color":"#6BBA70"});
			
			//make ajax request only needed
			var selected = $tabs.tabs('option', 'selected');
			if(selected === 1){
				getDbTables(SMA);
			}
		});
		
		$(".table").live("click", function(e){
			e.stopPropagation();
			var currentDb = SMA.StatusTools.DbTableManager.getDb();
			var tableName = $(this).text();
			var dbName = $(this).parent().parent().prev(".database").text();
			SMA.StatusTools.DbTableManager.setDb(dbName);
			SMA.StatusTools.DbTableManager.setTable(tableName);
			
			//reset orderField
			SMA.QueryManager.Browse.reset();
			
			$(".database").each(function(){$(this).css("background-color","white")});
			$(this).parent().parent().prev(".database").css({"background-color":"#6BBA70"});
			
			$(".table").each(function(){$(this).css("background-color","white")});
			$(this).css({"background-color":"#abd4ad"});
			
			//make ajax request if needed
			var selected = $tabs.tabs("option", "selected");
			if(selected === 2){
				getTableStructure(SMA);
			} else if(selected === 3){
				getTableRows(SMA, 1);
			}
			
			if(currentDb !== dbName){
				if(selected === 1){
					getDbTables(SMA);
				}
			}
		});
		
		$(".tables_tab").bind("click", function(){
			getDbTables(SMA)
		});
		
		//actions - tables
		$(".action-tables-browse").live("click", function(e){
			SMA.StatusTools.DbTableManager.setTable($(this).parent().find("td:first").text());
			$(".browse_tab").trigger("click");
		});
		
		$(".action-tables-structure").live("click", function(e){
			SMA.StatusTools.DbTableManager.setTable($(this).parent().find("td:first").text());
			$(".structure_tab").trigger("click");
		});
		
		$(".action-tables-truncate").live("click", function(e){
			var truncateQuery = "TRUNCATE TABLE " + $(this).parent().find("td:first").text();
			var ensureTruncate = window.confirm("Are You Sure <" + truncateQuery + ">");
			if(ensureTruncate){
				var options = {
					postData : {
						db : SMA.StatusTools.DbTableManager.getDb(),
						rawSql : truncateQuery
					}
				};
				ExtendRecursive(SMA.QueryManager.RawSql.options, options);
				runRawSql(SMA, options);
			}
		});
		
		$(".action-tables-drop").live("click", function(e){
			var dropQuery = "DROP TABLE " + $(this).parent().find("td:first").text();
			var ensureDrop = window.confirm("Are You Sure <" + dropQuery + ">");
			if(ensureDrop){
				var options = {
					postData : {
						db : SMA.StatusTools.DbTableManager.getDb(),
						rawSql : dropQuery
					}
				};
				ExtendRecursive(SMA.QueryManager.RawSql.options, options);
				runRawSql(SMA, options);
			}
		});	
		
		$(".structure_tab").bind("click", function(){
			getTableStructure(SMA)
		});

		$("#run_button").bind("click", function(e){
			SMA.QueryManager.RawSql.orderField = "";
			SMA.QueryManager.RawSql.orderField = "";
			var rawSql = trim($("#raw_sql_input").val());
			rawSql = rawSql.replace(/\s/g, " ");
			SMA.QueryManager.RawSql.rawSql = rawSql;
			SMA.QueryManager.RawSql.limit = /\s+LIMIT\s+/i.test(rawSql);
			SMA.QueryManager.RawSql.orderBy = /\s+ORDER BY\s+/i.test(rawSql);
			SMA.QueryManager.RawSql.select = /^SELECT/i.test(rawSql);
			SMA.QueryManager.RawSql.explain = /^EXPLAIN/i.test(rawSql);
			
			var options = {};
			options.browser = "#raw-sql-browser";
			
			options.select = SMA.QueryManager.RawSql.select;
			var postData = {
					action: "runRawSql",
					db : SMA.StatusTools.DbTableManager.getDb(),
					rawSql : SMA.QueryManager.RawSql.rawSql,
					fields : 1,
					orderField : SMA.QueryManager.RawSql.orderField,
					orderBy : SMA.QueryManager.RawSql.orderBy,
					getNumRows : 1,
					delimiter: $("#delimiter").val()
				};
			options.postData = postData;
			
			//if limit is set (or single query) don't add limit clause
			if(SMA.QueryManager.RawSql.select && ! SMA.QueryManager.RawSql.limit){
					options.postData.start = 0;
					options.postData.perPage = SMA.PagerManager.RawSql.perPage;
					options.getPager = true;
			} else {
				$("#sql-tab").find(".pages").html("");
			}
			runRawSql(SMA, options);
		});
		
		$(".browse_tab").bind("click", function(e){
			if (SMA.StatusTools.DbTableManager.getTable() === null || SMA.StatusTools.DbTableManager.getTable() === "") {
				SMA.StatusTools.MessageManager.saveMsg("No Table Selected").displayMsg("error");
				$("#browse-tab").find(".pages").html("");
				$("#table-browser").html("");
			} else {
				getTableRows(SMA, 1);
			}
		});
		
		//pager
		$("#browse-tab .pager_link").live("click", function(e){
			var _page = Number($(this).attr("title"));
			SMA.PagerManager.Browse.currentPage = _page;
			var options = {};
			options.browser = "#table-browser";
			options.getPager = false;
			options.sortField = SMA.QueryManager.Browse.orderField;
			options.sortBy = SMA.QueryManager.Browse.orderBy;
			var postData = {
				action: "runRawSql",
				db : SMA.StatusTools.DbTableManager.getDb(),
				table : SMA.StatusTools.DbTableManager.getTable(),
				fields : 0,
				orderField : SMA.QueryManager.Browse.orderField,
				orderBy : SMA.QueryManager.Browse.orderBy,
				start : (_page-1) * (SMA.PagerManager.Browse.perPage),
				perPage : SMA.PagerManager.Browse.perPage,
				getNumRows : 0
			};
			
			options.postData = postData;
			runRawSql(SMA, options);
			SMA.PagerManager.Browse.getPager(_page);
		});
		
		$("#sql-tab .pager_link").live("click", function(e){
			var _page = Number($(this).attr("title"));
			SMA.PagerManager.RawSql.currentPage = _page;
			var options = {};
			options.browser = "#raw-sql-browser";
			options.getPager = false;
			options.sortField = SMA.QueryManager.RawSql.orderField;
			options.sortBy = SMA.QueryManager.RawSql.orderBy;
			var postData = {
				action: "runRawSql",
				db : SMA.StatusTools.DbTableManager.getDb(),
				rawSql : SMA.QueryManager.RawSql.rawSql,
				fields : 0,
				orderField : SMA.QueryManager.RawSql.orderField,
				orderBy : SMA.QueryManager.RawSql.orderBy,
				start : (_page-1) * (SMA.PagerManager.RawSql.perPage),
				perPage : SMA.PagerManager.RawSql.perPage,
				getNumRows : 0
			};
			
			options.postData = postData;
			runRawSql(SMA, options);
			SMA.PagerManager.RawSql.getPager(_page);
		});
		
		//sort
		$("#table-browser .column").live("click", function(e){
			SMA.QueryManager.Browse.orderField = $(this).text();
			SMA.QueryManager.Browse.orderBy = (SMA.QueryManager.Browse.orderBy === "ASC") ? "DESC" : "ASC";
			
			var options = {};
			options.browser = "#table-browser";
			options.getPager = false;
			options.sortField = $(this).text();
			options.sortBy = SMA.QueryManager.Browse.orderBy;
			var postData = {
				action: "runRawSql",
				db : SMA.StatusTools.DbTableManager.getDb(),
				table : SMA.StatusTools.DbTableManager.getTable(),
				fields : 0,
				orderField : SMA.QueryManager.Browse.orderField,
				orderBy : SMA.QueryManager.Browse.orderBy,
				start : (SMA.PagerManager.Browse.currentPage-1) * (SMA.PagerManager.Browse.perPage),
				perPage : SMA.PagerManager.Browse.perPage,
				getNumRows : 0
			};

			options.postData = postData;
			runRawSql(SMA, options);
		});
		
		$("#raw-sql-browser .column").live("click", function(e){
			SMA.QueryManager.RawSql.orderField = $(this).text();
			SMA.QueryManager.RawSql.orderBy = (SMA.QueryManager.RawSql.orderBy === "ASC") ? "DESC" : "ASC";  

			var options = {};
			options.browser = "#raw-sql-browser";
			options.getPager = false;
			options.sortField = $(this).text();
			options.sortBy = SMA.QueryManager.RawSql.orderBy;
			var postData = {
				action: "runRawSql",
				db : SMA.StatusTools.DbTableManager.getDb(),
				rawSql : SMA.QueryManager.RawSql.rawSql,
				fields : 0,
				orderField : SMA.QueryManager.RawSql.orderField,
				orderBy : SMA.QueryManager.RawSql.orderBy,
				start : (SMA.PagerManager.RawSql.currentPage-1) * (SMA.PagerManager.RawSql.perPage),
				perPage : SMA.PagerManager.RawSql.perPage,
				getNumRows : 0
			};
			
			options.postData = postData;
			runRawSql(SMA, options);
			SMA.PagerManager.RawSql.getPager(SMA.PagerManager.RawSql.currentPage);
		});
		
		$("#show").bind("click", function(e){
			SMA.PagerManager.Browse.perPage = Number($("#browse-tab").find(".per-page").val());
			SMA.PagerManager.RawSql.perPage = Number($("#browse-tab").find(".per-page").val());
			$(".browse_tab").trigger("click");
		});
		
		//editing rows
		$(".action-browse-edit").live("click", function(e){
			$("#edit-row-dialog").slideDown("fast");
			SMA.EditManager.Row.currentRow = Number($(this).parent("tr").attr("id"));
			SMA.EditManager.Row.displayEditRowDialog(SMA.EditManager.Row.currentRow);
		});
		
		$("#action-save-row-button").bind("click", function(e){
			var options = {
				postData : {
					db : SMA.StatusTools.DbTableManager.getDb(),
					rawSql : SMA.EditManager.Row.getUpdateSql()
				}
			};
			ExtendRecursive(SMA.QueryManager.RawSql.options, options);
			runRawSql(SMA, options);
			
			setTimeout(function(){
				getTableRows(SMA, SMA.PagerManager.Browse.currentPage)
			}, 1000);
		});
		
		$(".action-browse-delete").live("click", function(e){
			SMA.EditManager.Row.currentRow = Number($(this).parent("tr").attr("id"));
			var ensureDelete = window.confirm("ARE YOU SURE <" + SMA.EditManager.Row.getDeleteSql() + ">");
			if (ensureDelete) {
				var options = {
					postData: {
						db: SMA.StatusTools.DbTableManager.getDb(),
						rawSql: SMA.EditManager.Row.getDeleteSql()
					}
				};
				ExtendRecursive(SMA.QueryManager.RawSql.options, options);
				runRawSql(SMA, options);
				
				setTimeout(function(){
					getTableRows(SMA, SMA.PagerManager.Browse.currentPage)
				}, 1000);
			}
		});
		
		//insert row
		$("#action-browse-insert-row-button").bind("click", function(e){
			if (SMA.StatusTools.DbTableManager.getDb() === null) {
				SMA.StatusTools.MessageManager.saveMsg("No Database Selected").displayMsg("error");
				$("#structure-tab").html("");
			} else if (SMA.StatusTools.DbTableManager.getTable() === null || SMA.StatusTools.DbTableManager.getTable() === "") {
				SMA.StatusTools.MessageManager.saveMsg("No Table Selected").displayMsg("error");
				$("#structure-tab").html("");
			} else {
				SMA.EditManager.Row.displayInsertRowDialog();
				$("#insert-row-dialog").slideDown("fast");
			}
		});
		
		$("#action-insert-row-button").bind("click", function(e){
			var options = {
				postData : {
					db : SMA.StatusTools.DbTableManager.getDb(),
					rawSql : SMA.EditManager.Row.getInsertSql()
				}
			};
			ExtendRecursive(SMA.QueryManager.RawSql.options, options);
			runRawSql(SMA, options);
		});
		
		//dialog-closer
		$(".dialog-closer").bind("click", function(e){
			e.preventDefault();
			$(this).parent().parent().slideUp("fast");
		});
		
		//create db
		$("#create-db-button").live("click", function(){
			var options = {
				postData : {
					db : SMA.StatusTools.DbTableManager.getDb(),
					rawSql : SMA.EditManager.Row.getCreateDbSql()
				}
			};
			ExtendRecursive(SMA.QueryManager.RawSql.options, options);
			runRawSql(SMA, options);
		});
		
		//drop db
		$(".action-drop-db").live("click", function(){
			var sql = "DROP DATABASE " + $(this).prev("td").text() ;
			var ensureDropDb = window.confirm("ARE YOU SURE <" + sql + ">");
			if(ensureDropDb){
				var options = {
					postData : {
						db : SMA.StatusTools.DbTableManager.getDb(),
						rawSql : sql
					}
				};
				ExtendRecursive(SMA.QueryManager.RawSql.options, options);
				runRawSql(SMA, options);
			}
		});
		
		$("#action-browse-check-all-rows").live("click", function(e){
			var checked = this.checked;
			if(checked){
				$(".action-browse-check-row").each(function(i,v){
					this.checked = true;
				});
			} else {
				$(".action-browse-check-row").each(function(i,v){
					this.checked = false;
				});
			}
		});
		
		$("#action-browse-delete-button").live("click", function(e){
			var pK = SMA.EditManager.Row.checkPK();
			if(pK){
				var selectedIds = "";
				$(".action-browse-check-row").each(function(i,v){
					if(this.checked !== false){
						selectedIds += SMA.EditManager.Row.rows[Number($(this).parent().parent("tr").attr("id"))][pK] + ",";
					}
				});
				
				if(selectedIds === ""){
					alert("No Rows Selected");
				} else {
					selectedIds = selectedIds.substr(0, (selectedIds.length-1));
					var deleteSql = "DELETE FROM " + SMA.StatusTools.DbTableManager.getTable();
					deleteSql += " WHERE " + pK + " IN (" + selectedIds + ")";
					
					var ensureDelete = window.confirm("ARE YOU SURE <" + deleteSql + ">");
					if(ensureDelete){
						var options = {
							postData : {
								db : SMA.StatusTools.DbTableManager.getDb(),
								rawSql : deleteSql
							}
						};
						ExtendRecursive(SMA.QueryManager.RawSql.options, options);
						runRawSql(SMA, options);
					}
				}
			}
		});
	});