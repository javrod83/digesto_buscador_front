

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
                	'<td class="position table-cell"></td>'+
                    '<td class="codigo table-cell">'+val.docNumber[0]['$']+'</td>'+
               		'<td class="numero_ley table-cell">'+val.docNumber[1]['$']+'</td>'+
	                '<td class="exportar table-cell">'+
	                	'<div class="exportar_html">'+
                            '<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=html&amp;docNumber='+val.docNumber[1]['$']+'">html</a>'+
                        '</div>'+
                        '<div class="exportar_pdf">'+
                            '<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=pdf&amp;docNumber='+val.docNumber[1]['$']+'">pdf</a>'+
                        '</div>'+
                        '<div class="exportar_xml">'+
                            '<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=xml&amp;docNumber='+val.docNumber[1]['$']+'">xml</a>'+
                        '</div>'+
	                '</td>'+
                    '<td class="titulo table-cell">'+
                    	'<h3>'+
                            '<a href="http://sparl-desa.hcdn.gob.ar:8080/exist/rest/digesto/transform/transform_01.xql?as=html&amp;docNumber='+val.docNumber[1]['$']+'">'+val.docTitle['$']+'</a>'+
                        '</h3>'+
    			 	    '<div class="fragmento">'+presentar_fragmento(val)+'</div>'+
                    '</td>'+
                    '<td class="fecha table-cell">'+val.docDate['$']+'</td>'+
                    '<td class="promulgacion table-cell">'+ presentar_promulgacion(val.step)+'</td>'+
                    '<td class="publicacion table-cell">'+presentar_publicacion(val.publication)+'</td>'+
                    '<td class="organismos table-cell">'+presentar_organizaciones(val)+ '</td>'+
                    '<td class="montos table-cell">'+presentar_montos(val)+'</td>'+
                    '<td class="referencias table-cell">'+presentar_referencias(val)+'</td>'+
                '</tr>'
            );
			
            function presentar_promulgacion(promulgacion)
                {
                    console.log(promulgacion);
                    if (promulgacion === undefined )
                        return("");
                    else
                        return formatea_fecha(promulgacion.date);
                }
                
            function presentar_publicacion(publicacion)
                {
                    if (publicacion.date === "1500-01-01")
                        return publicacion.showAs;
                    else
                        return publicacion.name+" "+formatea_fecha(publicacion.date);
                }
                
            function formatea_fecha(date)
                {
                    var temp = date.split("-")
                    
                    return temp[2]+"-"+temp[1]+"-"+temp[0];
                }
                
			function presentar_organizaciones(val)
				{ 	
					var out = "" ;
					if (val.organizations === undefined)
						return out;
					$.each(val.organizations,function(i,v){
						out+= '<div class="nota"><a class="brand-green">'+v+'</a></div>'
					});

					return out ;
				}

			function presentar_montos(val)
				{
					var out = "" ;
					if (val.quantities === undefined)
						return out;
					$.each(val.quantities,function(i,v){
							out+= '<div class="nota"><a class="brand-orange">'+v+'</a></div>'
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
								out +='<div class="nota">'+
                    				'<a href="'+v.reference.link+'" class="brand-blue">'+v.reference.name+'</a>'+
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
