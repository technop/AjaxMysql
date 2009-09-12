		/**
		 * Extends(Merges) sub Object Recursively
		 * 
		 * @param {Object} sup
		 * @param {Object} sub
		 * @return void
		 */
		function ExtendRecursive(sup,sub){
			for(var i in sup){
				if(typeof sub[i] === "undefined"){
					sub[i] = sup[i];
					if(typeof sup[i] === "object"){
						ExtendRecursive(sup[i], sub[i]);
					}
				} else if(typeof sub[i] === "object"){
						ExtendRecursive(sup[i], sub[i]);
				}
			}
		}
		
		/**
		 * Trim Function
		 * Strip whitespaces from the beginning and the end of string
		 * 
		 * @param String str
		 * @return String
		 */
		function trim(str){
			return str.replace(/^\s+|\s+$/, "");
		}
		
		/**
		 * Creates HTML Table By Using JSON
		 * 
		 * @param object (table attributes)
		 * @param string (table caption)
		 * @param object (table head)
		 * @param object (table body)
		 * @param object (table foot)
		 * @param string (additional table body cell)
		 * 
		 * @return string (HTML Table)
		 */
		function createTable(tableAttr, caption, head, body, foot, addCell){
	
			function addAttributes(attrObject){
				if( ! attrObject){
					var attr = "";
					for(var p in attrObject){
						attr += p + "=" + tableAttr[p] + " ";
					}
					return attr;
				}
				return "";
			}
			
			var table = "<table " + addAttributes(tableAttr) + " cellspacing='1'>";
			
			if(caption !== null){
				table += "<caption>" + caption + "</caption>";
			}
			
			if(head !== null){
				table += "<thead " + addAttributes(head.attributes) + ">";
				table += "<tr>";
				
				if(head.prependHeaderCell !== undefined){
							table += head.prependHeaderCell;
				}
				for(var p in head.fields){
					if(typeof head.sortField !== ""){
						
						if(head.fields[p] == head.sortField){
							if(head.sortBy == "ASC"){
								table += "<th class='column'>" + head.fields[p] + "<img src='img/up.png' style='position:relative; top:2px; right:0;'/></th>";
							} else {
								table += "<th class='column'>" + head.fields[p] + "<img src='img/down.png' style='position:relative; top:2px; right:0;'/></th>";
							}
						}else{
							table += "<th class='column'>" + head.fields[p] + "</th>";
						}
	
					} else {
						table += "<th class='column'>" + head.fields[p] + "</th>";
					}
					
				}
				if(head.addHeaderCell !== undefined){
							table += head.addHeaderCell;
				}
				
				table += "</tr>";			
				table += "</thead>";
			}
			
			if(body !== null){
				table += "<tbody " + addAttributes(body.attributes) + ">";
			
				for(var i in body.rows){
					//title attribute is used for editing rows
					if(i % 2 == 0){
						table += "<tr class='even' " + addAttributes(body.rowAttributes) + " id='" + i + "'>";
					} else {
						table += "<tr " + addAttributes(body.rowAttributes) + " id='" + i + "'>";
					}
					
					if(body.prependBodyCell !== undefined){
							table += body.prependBodyCell;
					}
					for(var p in body.rows[i]){
						if(body.dbTableRow === true){
							if(body.rows[i][p] !== null){
								table += "<td " + addAttributes(body.cellAttributes) + ">" + body.rows[i][p].substr(0,70) + "</td>";
							} else {
								table += "<td " + addAttributes(body.cellAttributes) + ">" + body.rows[i][p] + "</td>";
							}
						} else {
							table += "<td " + addAttributes(body.cellAttributes) + ">" + body.rows[i][p] + "</td>";
						}
						
					}
					if(body.addBodyCell !== undefined){
							table += body.addBodyCell;
					}
					table += "</tr>";
				}
			}
			
			if(foot !== null){
				table += "<tfoot " + addAttributes(foot.attributes) + ">";
				table += "<tr>";
				for(var p in head.headers){
						table += "<td>" + foot.rows[p] + "</td>";
				}
				table += "</tr>";		
				table += "</tfoot>";
			}

			return table;
		}