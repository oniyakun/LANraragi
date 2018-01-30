//Functions for DataTable initialization.

//Executed onload of the archive index to initialize DataTables and other minor things.
//This is painful to read.
function initIndex(pagesize,dataSet)
{
	thumbTimeout = null;
									
	$.fn.dataTableExt.oStdClasses.sStripeOdd = 'gtr0';
	$.fn.dataTableExt.oStdClasses.sStripeEven = 'gtr1';

	//datatables configuration
	arcTable= $('.itg').DataTable( {
		'data': dataSet, 
		'lengthChange': false,
		'pageLength': pagesize,
		'order': [[ 1, 'asc' ]],
		'dom': '<"top"ip>rt<"bottom"p><"clear">',
		'language': {
				'info':           'Showing _START_ to _END_ of _TOTAL_ ancient chinese lithographies.',
				'infoEmpty':      '<h1>No archives to show you ! Try <a href="upload">uploading some</a> ?</h1><br/>(If you dropped files into the content folder, please wait for the cache to build.)',
			},
		'preDrawCallback': thumbViewInit, //callbacks for thumbnail view
		'rowCallback': buildThumbDiv,
		'columns' : [
			{ className: 'itdc', 
			  'width': '20',
			  'data': null,
			  'render': actionColumnDisplay
			},
			{ className: 'title itd',
			  'data': null,
			  'render': titleColumnDisplay
			},
			{ className: 'artist itd',
			  'data': 'artist',
			  'render': genericColumnDisplay
			},
			{ className: 'series itd',
			  'data': 'series',
			  'render': genericColumnDisplay
			},
			{ className: 'language itd',
			  'data': 'language',
			  'render': genericColumnDisplay
			},
			{ className: 'tags itd',
			  'data': 'tags',
			  'render': function (data, type, full, meta ) {
			  			if(type == "display"){

			  				line = '<span class="tags" style="text-overflow:ellipsis;">'+data+'</span>';
			  				line+=buildTagsDiv(data);
							return line;
			  			}
			  		return data;
			  		}
			}
		],
	});

	//add datatable search event to the local searchbox and clear search to the clear filter button
	$('#srch').keyup(function(){
	    arcTable.search($(this).val()).draw() ;
	});

	$('#clrsrch').click(function(){
		arcTable.search('').draw(); 
		$('#srch').val('');
		});

	//clear searchbar cache
	$('#srch').val('');

	//nuke style of table - datatables seems to assign its table a fixed width for some reason.
	$('.itg').attr("style","")

	//Init Thumbnail Mode if enabled - we do it twice in order to initialize it at the value the user has stored.
	//(Yeah it's shitty but it works so w/e)
	switch_index_view();
	switch_index_view();
			
}

//For datatable initialization, columns with just one data source display that source as a link for instant search.
function genericColumnDisplay(data,type,full,meta) {
	if(type == "display")
		return '<a style="cursor:pointer" onclick="$(\'#srch\').val($(this).html()); arcTable.search($(this).html()).draw();">'+data+'</a>';

	return data;
}

function actionColumnDisplay(data,type,full,meta) {
	if(type == "display"){
	      return '<div style="font-size:16px">'
	      		+'<a href="./api/servefile?id='+data.arcid+'" title="Download this archive."><i class="fa fa-save" style="margin-right:2px"></i><a/>'
	      		+'<a href="./edit?id='+data.arcid+'" title="Edit this archive\'s tags and data."><i class="fa fa-pencil-alt"></i><a/></div>';
			}

	return data;
}

function titleColumnDisplay(data,type,full,meta) {
	if(type == "display"){

    return '<span style="display: none;">'+data.title+'</span><a class="caption-container" href="./reader?id='+data.arcid+'">'
    	 + '<div class="caption" style="position:absolute;"><img src="./api/thumbnail?id='+data.arcid+'"></div>'
    	 + data.title+'</a><img src="img/n.gif" style="float: right; margin-top: -15px; z-index: -1; display: '+data.isnew+'">';
	}

	return data.title;			
}

//Functions executed on DataTables draw callbacks to build the thumbnail view if it's enabled:
//Inits the div that contains the thumbnails
function thumbViewInit(settings) {
	//we only do all this thingamajang if thumbnail view is enabled
	if (localStorage.indexViewMode == 1)
	{
		// create a thumbs container if it doesn't exist. put it in the dataTables_scrollbody div
		if ($('#thumbs_container').length < 1) 
			$('.top').after("<div id='thumbs_container'></div>");

		// clear out the thumbs container
		$('#thumbs_container').html('');

		$('.itg').hide();
	}
	else
	{
		//Destroy the thumb container and make the table visible again
		$('#thumbs_container').remove();
		$('.itg').show();
	}

}

//Builds a id1 class div to jam in the thumb container for an archive whose JSON data we read
function buildThumbDiv( row, data, index ) {

	if (localStorage.indexViewMode == 1)
	{
		//Build a thumb-like div with the data and jam it in thumbs_container
		thumb_div = '<div style="height:335px" class="id1">'+
						'<div class="id2 caption-container">'+
							buildTagsDiv(data.tags)+
							'<div class="id44">'+
									'<div style="float:right">'+
										'<img src="img/n.gif" style="float: right; display: '+data.isnew+'">'+
									'</div>'+
							'</div>'+
							'<a href="./reader?id='+data.arcid+'" title="'+data.title+'">'+data.title+'</a>'+
						'</div>'+
						'<div style="height:280px" class="id3">'+
							'<a href="./reader?id='+data.arcid+'">';

		thumb_div += 		'<img style="position:relative;" id ="'+data.arcid+'_thumb" title="'+data.title+'" src="./img/wait_warmly.jpg"/>'+
							 '<i id="'+data.arcid+'_spinner" class="fa fa-4x fa-cog fa-spin ttspinner"></i>'+
							 '<img style="position:absolute; top:0; left:0; width:200px" src="./api/thumbnail?id='+data.arcid+'"/>';

		thumb_div +=		'</a>'+
						'</div>'+
						'<div class="id4">'+
							'<div class="id41"><a style="cursor:pointer" onclick="$(\'#srch\').val($(this).html()); arcTable.search($(this).html()).draw();">'+
								data.artist+'</a></div>'+
							'<span style="font-size:16px"><a title="Download this archive." href="./api/servefile?id='+data.arcid+'">'+
								'<i style="margin-right:2px" class="fa fa-save"></i>'+
							'</a>'+
							'<a title="Edit this archive\'s tags and data." href="./edit?id='+data.arcid+'">'+
								'<i class="fa fa-pencil-alt"></i>'+
							'</a></span>'+
							'<div class="id42"><a style="cursor:pointer" onclick="$(\'#srch\').val($(this).html()); arcTable.search($(this).html()).draw();">'+
								data.series+'</a></div>'+
						'</div>'+
					'</div>';

		$('#thumbs_container').append(thumb_div);
	}
}

//Builds a caption div containing clickable tags. Uses a string containing all tags, split by commas.
function buildTagsDiv(tags)
{
	if (tags === "")
		return "";

	line='<div class="caption" style="position:absolute;">';

	tags.split(/,\s?/).forEach(function (item) {
	    line+='<div class="gt" onclick="$(\'#srch\').val($(this).html()); arcTable.search($(this).html()).draw();">'+item+'</div>';
	});

	line+='</div>';
	return line;
}