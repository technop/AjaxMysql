<?php

	/**
	 * Db Class Adapter
	 * 
	 * @author Yasin DAĞLI
	 */
	class SmartDb
	{
		/**
		 * @var database handler
		 */
		private $_dbh;
		
		/**
		 * Sets Content Type and Provides Db Connection
		 * 
		 * @param object $dbh
		 * @return void
		 */
		public function __construct($dbh)
		{
			$this->_dbh = $dbh;
		}
		
		/**
		 * Gets Error Message JSON String
		 * 
		 * @return string (json)
		 */
		public function getErrorMsg()
		{
			return '{"success":false, "errorMsg":"' . $this->_dbh->getError() . '"}';
		}
		
		/**
		 * Gets Db > Table Navigation JSON String
		 * 
		 * @return string (json)
		 */
		public function getDatabasesAndTables()
		{
			$databasesAndTables = $this->_dbh->getDatabasesAndTables();
			if( ! $databasesAndTables){
				return $this->getErrorMsg();
			}
			return '{"success":true, "databasesAndTables":' . json_encode($databasesAndTables) . '}';
		}

		/**
		 * Gets Database Server Information JSON String
		 * 
		 * @return string (json)
		 */
		public function getDbServerInfo()
		{
			$serverInfo = $this->_dbh->getDbServerInfo();
			if( ! $serverInfo){
				return $this->getErrorMsg();
			}
			return '{"success":true, "serverInfo":' . json_encode($serverInfo) . '}';
		}
		
		/**
		 * Gets Database Tables (Table Information) JSON String 
		 *  
		 * @param string $db
		 * @return string
		 */
		public function getDbTables($db)
		{
			$tables = $this->_dbh->getDbTables($db);
			if( ! $tables){
				return $this->getErrorMsg();
			}
			return '{"success":true, "table":' . json_encode($tables) . '}';
		}
		
		/**
		 * Gets Table or Single Query Result JSON String
		 * 
		 * @return string (json)
		 */
		public function getTable($sql, $fields = true, $db = null, $table = null, $start = null, $perPage = null, $orderField = null, $orderBy = null, $getNumRows = true, $delimiter = null)
		{
			$table = $this->_dbh->getTable($sql, $fields, $db, $table, $start, $perPage, $orderField, $orderBy, $getNumRows, $delimiter);
			if( ! $table){
				return $this->getErrorMsg();
			}
			return '{"success":true, "table":' . json_encode($table) . '}';	
		}
	}