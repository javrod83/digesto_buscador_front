

//CONFIGURACION DE LOS CALENDARIOS 
var calendar_conf = {
	monthNames  : [ "Enero", "Febrero", "Martes", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ],
	dateFormat  : "yy-mm-dd",
	dayNamesMin : [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ],
	changeYear  : true,
	yearRange   : "1900:"+(new Date().getFullYear()),
	changeMonth :true
}; 

var busqueda = {
	base_url : "http://sparl-desa.hcdn.gob.ar:8080/exist/rest/db/digesto/xql/search-index.xql?",
	bind     : function()
		{

			$('button').click(function(event){
				//console.log("clicked ! ") ;
				var  checkbox = $(event.currentTarget).find(':checkbox'); 
				//console.log(checkbox.prop('checked') )  ;

				checkbox.prop('checked' , !checkbox.prop('checked'))

			});

			$('#buscar-boton').click(busqueda.apply);
			$('#buscar-value').keypress(function(e) {
			    if(e.which == 13) {
			    	busqueda.apply();
			    }
			});
		},
	apply    : function()
		{
			resultados.clean();
			resultados.show_loader();
			$.getJSON(busqueda.url(),resultados.proccess);
		},
	url      : function()
		{
			return  busqueda.base_url +filtros.params() ; 
		}
};

var filtros = {
	bind : function ()
		{
			$("#numero-check").click(function(event){
				if ($(event.currentTarget).is(":checked"))
					$("[data-id='ramas-select'],.desactivable").addClass("disabled");
				else
					$("[data-id='ramas-select'],.desactivable").removeClass("disabled");
			});
			
			//calendario
			$("#fecha-desde-value").datepicker(calendar_conf);
			$("#fecha-desde-value").datepicker( 'option' , 'onClose', fecha_desde_cambio );

			$("#fecha-hasta-value").datepicker(calendar_conf);
			$("#fecha-hasta-value").datepicker( 'option' , 'onClose', fecha_hasta_cambio );

			function fecha_desde_cambio ()
				{ $("#fecha-hasta-value").datepicker( "option", "minDate",$( "#fecha-desde-value" ).val() );}

			function fecha_hasta_cambio () 
				{ $("#fecha-desde-value").datepicker( "option", "maxDate", $( "#fecha-desde-value" ).val() );} 

		},
	params : function ()
		{

			//ley,query, rama, fechaDesde, fechaHasta
			var le_query ="" ; 
			 if( $('#numero-check').is(":checked")) //si el check de numero de ley esta pinchado
			 	le_query += "ley=" + $('#numero-value').val() ;  
			 else
			 	{
			 		if ($('#buscar-value').val () !== '')
			 			{le_query += "query=" + $('#buscar-value').val();}
			 		if ($('#ramas-check').is(":checked") )	
			 			{le_query += ((le_query.length  === busqueda.base_url.length)?"":"&") + "rama=" + $("#ramas-select").val();}
			 		if ($('#fecha-desde-check').is(":checked") )
			 			{le_query += ((le_query.length  === busqueda.base_url.length)?"":"&") +"fechaDesde=" + $('#fecha-desde-value').val();}
			 		if ($('#fecha-hasta-check').is(":checked") )
			 			{le_query += ((le_query.length  === busqueda.base_url.length)?"":"&") +"fechaHasta=" + $('#fecha-hasta-value').val();}
			 	}
			 return le_query; 
		}
};


	

var resultados = {
	proccess 	   : function(payload)
		{
			resultados.hide_loader();
			if (payload.normas === null)
				{	resultados.show_no_result();	}
			else
				$.each(payload.normas.entry,function(index,element){
					resultados.append(element);
				});
		},
	clean          : function ()
		{
			$('#resultados-cuerpo').empty();
		},
	append  	   : function (val)
		{
			$('#resultados-cuerpo').append(
				'<tr>'+
                	'<td class="codigo">'+val.docNumber[0]['$']+'</td>'+
               		'<td class="numero_ley">'+val.docNumber[1]['$']+'</td>'+
	                '<td>'+
	                	'<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=html&amp;docNumber='+val.docNumber[1]['$']+'" style="background-color:#00b4e1">html</a>'+
	                '</td>'+
                	'<td>'+
                	'<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=xml&amp;docNumber='+val.docNumber[1]['$']+'" style="background-color:#EC9F48;">xml</a>'+
                '</td>'+
                '<td class="titulo">'+
                	'<div class="el_titulo">'+val.docTitle['$']+'</div>'+
			 	    '<div class="fragmento">'+presentar_fragmento(val)+'</div>'+
                '</td>'+
                '<td class="fecha">'+val.docDate['$']+'</td>'+
                '<td class="fecha">'+'consultar agus' +'</td>'+
                '<td class="fecha">'+'consultar agus' +'</td>'+
                '<td class="organismos">'+presentar_organizaciones(val)+ '</td>'+
                '<td class="montos">'+presentar_montos(val)+'</td>'+
                '<td class="referencias">'+presentar_referencias(val)+
                '</td>'+
            '</tr>'
            );
			
			function presentar_organizaciones(val)
				{ 	
					var out = "" ;
					if (val.organizations === undefined)
						return out;
					$.each(val.organizations,function(i,v){
						out+= '<div class="organismo">'+v+'</div>'
					});

					return out ;
				}

			function presentar_montos(val)
				{
					var out = "" ;
					if (val.quantities === undefined)
						return out;
					$.each(val.quantities,function(i,v){
							out+= '<div class="monto">'+v+'</div>'
					});

					return out ;
				}

			function presentar_referencias(val)
				{
					var out = "" ;
					if ( val.references === null || val.references === undefined )
						return out;
					//console.log(val.references);
					$.each(val.references,function(i,v){
						if (v !== null)
							{
								out +='<div>'+
                    				'<a href="'+v.reference.link+'" >'+v.reference.name+'</a>'+
                    			'</div>'; 
							}
					});

					return out ;
				}

			function presentar_fragmento(val)
				{
					var temp = "" ; 
					var out  = "" ;
					
					if ( val.fragments === null)
						return out ; 
					else if (typeof val.fragments.p[0] === 'string')
						{
							temp = val.fragments.p[0];
						}
					else 
						{
							$.each(val.fragments.p[0],function(i,v){ 
								if (typeof v === 'string')
									temp+= " "+ v ;
								else
									for(var k in v) 
										if (v[k]['$'] !== undefined) 
											temp+=" "+(v[k]['$']) 
							});
						}
					
					temp = temp.toLowerCase().split(val.query.toLowerCase());

					$.each(temp,function(i,v){
						if (temp.length-1 !== i )
							out+= v + '<strong class="busqueda-fragmento"> '+val.query+'</strong>' ;
						else 
							out+=" "+v;    
					});

					return out;
				} 
		},
	show_loader    : function ()
		{
			$('#overlay').fadeIn();
		},
	hide_loader    : function ()
		{
			$('#overlay').fadeOut();
		},
	show_no_result : function ()
		{
			$('#resultados-cuerpo').html('No se encontraron resultados');
		}
} ; 



// cuando todos los elementos de la pagina esten cargados buscar los registros del indice
$( document ).ready(function(){
		//campo de busqueda 
		busqueda.bind();

		//campo de filtros
		filtros.bind();
		
		//resultados mostrar todo !!!! 
		$('#buscar-boton').click();
	});
