/**
 * Pager Function
 * Creates Customizable Page Links
 * 
 * Copyright (C) Yasin DAĞLI
 * 
 * @author Yasin DAĞLI <yasindagli@gmail.com>
 * 15-05-2009
 * 
 * @example //example usage with jquery
 * 	
 * 		var pager = new Pager();
 *		pager.setBound(15);
 *
 *		$('div#pager').html(pager.getLinks());
 *		$('.pager_link').live('click', function(){
 *			var page = Number( $(this).attr('title') );	
 *			$('div#pager').html( pager.getLinks(page) );
 *		});
 *
 *		//html body
 *		<body>
 *			<div id="pager"></div>	
 *		</body>
 */
function Pager()
{
	this.bound = 10;
	this.linkNumber = 7;
	this.firstLink = 'First';	
	this.lastLink = 'Last';
	this.prevLink = '&lt; Prev';
	this.nextLink = 'Next &gt;';
	
	this.setBound = function(bound){
		this.bound = bound;
	}	
	this.setLinkNumber = function(linkNumber){
		this.linkNumber = linkNumber;
	}				
	this.setFirstLink = function(firstLink){
		this.firstLink = firstLink;
	}
	this.setLastLink = function(lastLink){
		this.lastLink = lastLink;
	}					
	this.setPrevLink = function(prevLink){
		this.prevLink = prevLink;
	}					
	this.setNextLink = function(nextLink){
		this.nextLink = nextLink;
	}				
	this.getLinks = function(curPage){
		
		if( typeof curPage == 'undefined' || curPage <= 0 ) curPage = 1;
		
		var links = '';
		
		//get first page's and previous page's links
		if( curPage > 1 ){
			links += '<a href="javascript:void(0);" class="pager_link" title="' + 1 + '"> ' + this.firstLink + ' </a> ';	
			links += ' <a href="javascript:void(0);" class="pager_link" title="' + (curPage - 1) + '"> ' + this.prevLink + ' </a> ';
		}
		
		//get previous pages' links
		for( var i = curPage - this.linkNumber; i < curPage; i++ ){
			if( i <= 0 ) continue;
			links += ' <a href="javascript:void(0);" class="pager_link" title="' + i + '"> ' + i + '</a> ';
		}
		
		//get current page's link
		links += '<span class="current_page">' + curPage + '</span> ';
		
		//get next pages' links
		for( var j = curPage + 1; j < curPage + ( this.linkNumber + 1 ) && j <= this.bound; j++ ){
			links += ' <a href="javascript:void(0);" class="pager_link" title="' + j + '"> ' + j + '</a> ';
		}
		
		//get next page's and last page's links
		if( curPage < this.bound ){		
			links += ' <a href="javascript:void(0);" class="pager_link" title="' + (curPage + 1) + '"> ' + this.nextLink + ' </a> ';				
			links += ' <a href="javascript:void(0);" class="pager_link" title="' + this.bound + '"> ' + this.lastLink + ' </a> ';
		}
		
		return links;
	}
}
//end of Pager Function