<?php
	
	/**
	 * Does all database operations.
	 * 
	 * @author Yasin DAĞLI
	 */
	class Db
	{
		/**
		 * Database Connection Link
		 * 
		 * @var resource
		 */
		private $_conn;
		
		/**
		 * Latest MySQL Error Message | User Specified Message
		 * 
		 * @var string
		 */
		private $_error;
		
		/**
		 * Latest MySQL Error Number
		 * 
		 * @var int
		 */
		private $_errno;
		
		/**
		 * Constructor - Provides db connection
		 * 
		 * @param string $host
		 * @param string $username
		 * @param string $password
		 * @return 
		 */
		public function __construct($host, $username, $password)
		{	
			$this->_conn = mysql_connect($host, $username, $password) or die('Connection Error'); 
		}
		
		/**
		 * Saves Last MySQL Error and Error No
		 * 
		 * @param string $msg [optional]
		 * @return void
		 */
		public function saveError($msg = null)
		{
			$this->_error = ($msg === null) ? mysql_error() : $msg;
			$this->_errno = mysql_errno();
		}
		
		/**
		 * Gets Last MySQL Error
		 * 
		 * @param void
		 * @return string 
		 */
		public function getError()
		{
			return $this->_error;
		}
		
		/**
		 * Gets Last MySQL Error No
		 * 
		 * @param void
		 * @return string
		 */
		public function getErrno()
		{
			return $this->_errno;
		}
		
		/**
		 * Get Databases And Tables Navigation Bar
		 * 
		 * @param void
		 * @return array (array("dbName"=>array(dbTables), ...))
		 */
		public function getDatabasesAndTables()
		{
			$result = mysql_query("SHOW DATABASES");
			if( ! $result ){
				$this->saveError();
				return false;
			}
			
			$databasesAndTables = array();
			while($dbRow = mysql_fetch_row($result)){
				$dbName = $dbRow[0];
				$query = "SHOW TABLES FROM $dbName";
				$result2 = mysql_query($query);
				
				if( ! $result2 ){
					$this->saveError();
					return false;
				}
				
				$tableArr = array();
				while($tblRow = mysql_fetch_row($result2)){
					$tableArr[] = $tblRow[0];
				}
				$databasesAndTables[$dbName] = $tableArr;
			}
			
			return $databasesAndTables;
		}
		
		/**
		 * Gets DbServer Information
		 * 
		 * @param void
		 * @return void
		 */
		public function getDbServerInfo()
		{
			//db server info
			$dbInfo = array();
			$status = explode(' ',  mysql_stat($this->_conn));
			//$dbInfo['stat'] = $status;
			$dbInfo["uptime"] = (int)($status[1] / 3600) . 'hrs';
			$dbInfo["host"] = mysql_get_host_info();
			$dbInfo["server"] = mysql_get_server_info();
			$dbInfo["protocol"] = mysql_get_proto_info();
			$dbInfo["client"] = mysql_get_client_info();
			$dbInfo["webServer"] = apache_get_version();
			
			//db collations
			$collArr = array();
			$rs = mysql_query("SELECT * FROM information_schema.COLLATION_CHARACTER_SET_APPLICABILITY ORDER BY COLLATION_NAME");
			if( ! $rs){
				$this->saveError();
				return false;
			}
			while($row = mysql_fetch_assoc($rs)){
				$collArr[] = $row;
			}
			$dbInfo["collations"] = $collArr;
			
			//databases
			$dbArr = array();
			$rs = mysql_query("SHOW DATABASES");
			if( ! $rs){
				$this->saveError();
				return false;
			}
			while($row = mysql_fetch_assoc($rs)){
				$dbArr[] = $row;
			}
			$dbInfo["databases"] = $dbArr;
			
			return $dbInfo;
		}
		
		/**
		 * Gets Database Tables with Table Information
		 * 
		 * @param string $db
		 * @return mixed
		 */
		public function getDbTables($db)
		{
			if( ! mysql_select_db($db)){
				$this->saveError();
				return false;
			}
			$resultTable = array();
			$resultTable["fields"] = array('Name', 'Engine', 'Collation', 'Rows','Size', 'Create Time');
			$sql = "SHOW TABLE STATUS";
			if( ! $rs = mysql_query($sql)){
				$this->saveError();
				return false;
			}

			for($i = 0; $row = mysql_fetch_assoc($rs); $i++){
				$resultTable['rows'][$i]['name'] = $row['Name'];
				$resultTable['rows'][$i]['engine'] = $row['Engine'];
				$resultTable['rows'][$i]['collation'] = $row['Collation'];
				$resultTable['rows'][$i]['rows'] = $row['Rows'];
				
    			
				$resultTable['rows'][$i]['size'] = round(($row['Data_length'] + $row['Index_length'])/1024, 2) . ' KB';
				$resultTable['rows'][$i]['create_time'] = $row['Create_time'];
			}
			return $resultTable;
		}
		
		/**
		 * Get Table Column Info
		 * 
		 * @param string $db
		 * @param string $table
		 * @return 
		 */
		public function getColumnInfo($table, $db = null)
		{
			if( $db !== null){
				if( ! mysql_select_db($db)){
						$this->saveError();
						return false;
				}
			}
			
			$sql = "SHOW COLUMNS FROM $table";
			if( ! $rs = mysql_query($sql)){
				$this->saveError();
				return false;
			}
			
			$resultArr = array();
			while($row = mysql_fetch_assoc($rs)){
				$resultArr[] = $row;
			}
			
			return $resultArr;
		}
		
		/**
		 * Gets Table Field Names
		 * 
		 * @param string (dbName)
		 * @param string (tableName)
		 * 
		 * @return array (enumerative array)
		 */
		public function getTableFieldNames($sql, $db = null)
		{
			if( $db !== null){
				if( ! mysql_select_db($db)){
						$this->saveError();
						return false;
				}
			}
			
			if( ! $rs = mysql_query($sql)){
				$this->saveError();
				return false;
			}
	
			$numFields = mysql_num_fields($rs);
			$fields = array();
			for($i = 0; $i < $numFields; $i++){
				$fields[] = mysql_field_name($rs, $i);
			}
			
			return $fields;
		}
		
		/**
		 * Gets Table or Executes Single Query
		 * 
		 * @param string $sql
		 * @param boolean $fields [optional]
		 * @param string $db [optional]
		 * @param string $table [optional]
		 * @param int $start [optional]
		 * @param int $perPage [optional]
		 * @param string $orderField [optional]
		 * @param string $orderBy [optional]
		 * @param boolean $getNumRows [optional]
		 * 
		 * @return mixed
		 */
		public function getTable($sql, $fields = true, $db = null, $table = null, $start = null, $perPage = null, $orderField = null, $orderBy = null, $getNumRows = true, $delimiter = null)
		{
			$resultTable = array();
			$rs = null;
			
			//ensure database connection for connection needed queries
			if( $db !== null){
				if( ! mysql_select_db($db)){
						$this->saveError();
						return false;
				}
			}
			
			//rebuild query for #browse-tab
			if($db !== null && $table !== null){
				$sql = "SELECT * FROM $table";
			}
			
			//query time
			$startTime = (float)array_sum(explode(" ", microtime()));
			if( ! $rs = mysql_query($sql)){
				$this->saveError();
				return false;
			}
			$total = (float)(array_sum(explode(" ", microtime())) - $startTime);
			$total = round($total, 5);

			if($getNumRows !== false){
				if($table !== null){
					$rs_ = mysql_query("SELECT COUNT(*) AS numRows FROM $table");
					$row_ = mysql_fetch_assoc($rs_);
					$numRows = $row_["numRows"];
				} else {
					$numRows = mysql_num_rows($rs);
				}
			} else {
				$numRows = false;
				$total = $total;
			}
			
			//rebuild query with order and limit clause
			if($orderField !== null && $orderBy !== null){
				$sql .= " ORDER BY $orderField $orderBy ";
				
				if($start !== null && $perPage !== null){
					$sql .= " LIMIT $start, $perPage";
					$sql .= $delimiter;
					$rs = mysql_query($sql);
				} else {
					$sql .= $delimiter;
					if( ! $rs = mysql_query($sql)){
						$this->saveError();
						return false;
					}
				}
			} else if($start !== null && $perPage !== null){
					$sql .= " LIMIT $start, $perPage";
					$sql .= $delimiter;
					if( ! $rs = mysql_query($sql)){
						$this->saveError();
						return false;
					}
			}
			
			//if query is single e.g. insert, delete, ...
			if(gettype($rs) !== "resource"){
				$resultTable["singleQuery"] = true;
				$resultTable["queryTime"] = $total;
				$resultTable["affectedRows"] = mysql_affected_rows();
				return $resultTable;
			}
			
			//table field names to build html table (used for once to fetch first table)
			if($fields !== false){
				$resultTable["fields"] = $this->getTableFieldNames($sql);
				if( ! $resultTable["fields"]){
					return false;
				}
				
				if($db !== null && $table !== null){
					//get table-column types for editing rows
					$resultTable["columnInfo"] = $this->getColumnInfo($table);
				}
			}

			$resultTable["singleQuery"] = false;
			$resultTable["queryTime"] = $total;
			$resultTable["numRows"] = $numRows;
			$resultTable["rows"] = array();
			
			while($rowObj = mysql_fetch_object($rs)){
				$resultTable["rows"][] = $rowObj; 
			}
			
			return $resultTable;
		}
	}
	//end of Db class