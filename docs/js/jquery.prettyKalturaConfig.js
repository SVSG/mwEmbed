// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	$.fn.prettyKalturaConfig = function( pluginName, flashvars, flashvarCallback, showSettingsTab ){
		var manifestData = {};
		
		return this.each(function() {
			/**
			 * Init
			 */
			// Setup _this pointer
			var _this = this;
			// setup master id for ( this )
			var id = $(this).attr('id');
			// set the target to loading while documentation is loaded
			$( this ).html('Loading <span class="blink">...</span>');
			var _this = this;
			/**
			 * Get a var object from plugin style location or from top level var 
			 */
			function getVarObj( attrName ){
				
				// Check for plugin config: 
				if(  manifestData[pluginName] && manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] )
				{
					return manifestData[pluginName].attributes[ attrName ];
				}
				
				// Check other plugins
				for( var pid in manifestData ){
					if( manifestData[ pid ] && manifestData[ pid ].attributes &&
							manifestData[ pid ].attributes[ attrName ]	)
					{
						return manifestData[ pid ].attributes[ attrName ];
					}
				}
				
				// Check for raw value object: 
				if( manifestData[attrName] ){
					return manifestData[attrName]; 
				}
				
				return {};
			}
			/**
			 * Set an attr value
			 */
			function setAttrValue( attrName, attrValue ){
				if( manifestData[pluginName] && manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] ){
					manifestData[pluginName].attributes[ attrName ].value = attrValue;
					// refresh the value
					manifestData[pluginName].attributes[ attrName ].$editVal.getEditValue( attrName );
				} else if( manifestData[attrName] ){
					manifestData[attrName].value = attrValue;
					// refresh the value
					manifestData[attrName].$editVal.getEditValue( attrName );
				} else {
					// look for other plugins with this property:
					for( var pid in manifestData ){
						if( manifestData[pid].attributes ){
							for( var pAttrName in manifestData[pid].attributes ){
								if( pAttrName == attrName ){
									manifestData[pid].attributes[ attrName ].value = attrValue;
									// refresh the value
									manifestData[pid].attributes[ attrName ].$editVal.getEditValue( attrName );
								}
							}
						}
					}
				}
			};
			/**
			 * Local getter methods
			 */
			function getJsonQuoteValue( attrName ){
				var val = getAttrValue( attrName )
				if( val === 'true' || val == 'false' ){
					return val
				}
				return '"' + val + '"';
			}
			function getAttrValue( attrName ){
				var attrValue = ( typeof getVarObj( attrName ).value != 'undefined' ) ? 
									getVarObj( attrName ).value :
									null;
				if( attrValue === true )
					attrValue = 'true';
				if( attrValue === false )
					attrValue = 'false';
				return attrValue;
			}
			function getAttrType( attrName ){
				return getVarObj( attrName )['type'] || 'string';
			}
			// jQuery method to support editing attributes
			$.fn.getEditValue = function( attrName ){
				// switch on edit types: 
				switch( getAttrType( attrName ) ){
					case 'boolean':
						$( this ).html( 
							$('<div class="btn-group" />').append(
								$('<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" />' ).append(
									getAttrValue( attrName ) + ' ' +
									'<span class="caret"></span>'
								), 
								$('<ul class="dropdown-menu" />').append(
									$('<li />').append(
										$('<a href="#">true</a>').click(function(){
											// activate button
											$('#btn-update-player-' + id ).removeClass('disabled');
											setAttrValue(attrName, 'true' );
										})
									),
									$('<li />').append(
										$('<a href="#">false</a>').click(function(){
											// activate button
											$('#btn-update-player-' + id ).removeClass('disabled');
											setAttrValue(attrName, 'false' );
										})
									)
								)
							)
						)
						$( this ).find('a').dropdown();
					break;
					case 'list':
						$( this ).empty();
						$listBtnGroup = $('<div class="btn-group">').append(
							'<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">' +
								'Set active' +
								'<span class="caret"></span>' +
							'</a>'
						);
						$listUl =$( '<ul class="dropdown-menu">');
						var valueObj = getVarObj( attrName );
						var list = valueObj[ 'list' ];
						var valueSet = getAttrValue( attrName ).split(',');
						$.each( list, function( key, title){
							var valueIndex = $.inArray( key, valueSet );
							$li = $( '<li> ')
								.append( 
									$('<a>')
									.css('cursor', 'pointer')
									.text( title )
									.click(function( event ){
										valueSet = getAttrValue( attrName ).split(',');
										valueIndex = $.inArray( key, valueSet );
										if( valueIndex == -1 ){
											$( this ).prepend( $('<i class="icon-ok">' ) );	
											setAttrValue( attrName, valueSet.join( ',' ) + ',' + key );
										} else {
											$( this ).find('i').remove();
											valueSet.splice( valueIndex, 1 );
											setAttrValue( attrName, valueSet.join( ',' ) );
										}
										// set update player button to active
										$('#btn-update-player-' + id ).removeClass('disabled');
									})
								)
							if( valueIndex != -1 ){
								$li.find('a').prepend( $('<i class="icon-ok">' ) );
							}
							$listUl.append( $li );
						});
						// add to this target:
						$( this ).append( 
								$listBtnGroup.append( $listUl )
						)
					break;
					case 'enum':
						var $enumUlList = $('<ul class="dropdown-menu" />');
						var valueObj = getVarObj( attrName );
						var enumList = valueObj['enum'];
						$.each( enumList, function( inx, eVal ){
							$enumUlList.append(
								$('<a href="#" />')
								.text( eVal )
								.click(function(){
									// activate button
									$('#btn-update-player-' + id ).removeClass('disabled');
									setAttrValue( attrName, eVal );
								})	
							)
						});
						$( this ).html(
							$('<div class="btn-group" />').append(
								$('<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" />' ).append(
									getAttrValue( attrName ) + ' ' +
									'<span class="caret"></span>'
								), 
								$enumUlList
							)
						);
						$( this ).find('a').dropdown();
					break;
					case 'color':
						var getHtmlColor = function(){
							return ( getAttrValue( attrName ) + "" ).replace('0x', '#' );
						}
						
						var $colorSelector =  $('<div />')
							.css({
								'width': '20px',
								'height': '20px',
								'border': 'solid thin black',
								'backgroundColor' : getHtmlColor(),
								'float' : 'left'
							})
							.addClass('colorSelector')
						$( this ).empty().append( 
							$colorSelector,
							$('<span />')
								.css( 'margin-left', '10px' )
								.text( getHtmlColor() )
						)
						$colorSelector.ColorPicker({
							color: getHtmlColor(),
							onShow: function ( colpkr ) {
								$( colpkr ).fadeIn( 500 );
								return false;
							},
							onHide: function (colpkr) {
								$( colpkr ).fadeOut( 500 );
								return false;
							},
							onChange: function (hsb, hex, rgb) {
								$colorSelector.css('backgroundColor', '#' + hex);
								// activate button
								$('#btn-update-player-' + id ).removeClass('disabled');
								setAttrValue( attrName, '0x' + hex );
							}
						});
					break;
					case 'string':
					default:
						var activeEdit = false;
						var editHolder = this;
						
						var getValueDispaly = function( attrName ){
							var attrValue = getAttrValue( attrName ) || '<i>null</i>';
							if( getAttrType( attrName ) == 'url'  &&  getAttrValue( attrName ) !== null ){
								attrValue = $('<span />').append(
									$('<a />').attr({
										'href': getAttrValue( attrName ),
										'target' : "_new"
									}).append(
										$('<i />').addClass('icon-share')
									),
									attrValue
								)
							}
							return attrValue
						}
						$( this ).css('overflow-x', 'hidden').html( getValueDispaly( attrName ) ).click(function(){
							if( activeEdit ){
								return ;
							}
							activeEdit = true;
							$( this ).html( 
								$('<input type="text" style="width:100px" />').val( getAttrValue( attrName ) )
							);
							$( this ).find('input').focus()
							.bind('keyup', function(e){
								// de-blur on enter:
								if( e.keyCode == '13' ){
									$(this).blur();
								}
							})
							.blur( function() {
								// activate button
								$('#btn-update-player-' + id ).removeClass('disabled');
								setAttrValue( attrName, $(this).val() );
								$( editHolder ).html(  getValueDispaly( attrName ) );
								activeEdit = false;
							} );
						});
					break;
				}
				return $( this );
				
			}; // end $.fn.getEditValue plugin
			
			function getAttrDesc( attrName ){
				if( getVarObj(  attrName )[ 'doc' ] ){
					return getVarObj(  attrName )[ 'doc' ];
				}
			}
			function getTableHead(){
				return $('<thead />').append(
						$('<tr><th style="width:140px">Attribute</th><th style="width:160px">Value</th><th>Description</th></tr>')
				);
			}
			function getAttrEdit(){
				
				var $mainPlugin = '';
				
				var $tbody = $('<tbody />');
				// for each setting get config
				if( manifestData[pluginName] ){
					$.each( manifestData[pluginName].attributes, function( attrName, attr){
						// only list "editable" attributes: 
						if( !attr.hideEdit ){
							// setup local pointer to $editVal:
							attr.$editVal = $('<div />').getEditValue( attrName ) ;
							$tbody.append( 
								$('<tr />').append( 
									$('<td />').text( attrName ),
									$('<td />').addClass('tdValue').append( attr.$editVal ),
									$('<td />').html( getAttrDesc( attrName ) )
								)
							)
						}
					});
					// add to main plugin:
					$mainPlugin = $('<table />')
						.addClass('table table-bordered table-striped')
						.append(
							getTableHead(),
							$tbody
						);
				}
				
				var $otherPlugins = $( '<div />' );
				// Check for secondary plugins:
				$.each( manifestData, function( otherPluginId, pluginObject ){
					if( pluginObject.attributes && pluginName != otherPluginId  ){
						$otherPlugins.append( 
								$('<span />').text( pluginObject.description )
							);
						var $otherPluginTB =  $('<tbody />');
						$.each( pluginObject.attributes, function( attrName, attr ){
							// for secondary plugins we only ad stuff for which we have fv
							// setup local pointer to $editVal:
							if( !attr.hideEdit && flashvars[ otherPluginId ][ attrName ] ){
								attr.$editVal = $('<div />').getEditValue( attrName ) ;
								$otherPluginTB.append( 
									$('<tr />').append( 
										$('<td />').text( attrName ),
										$('<td />').addClass('tdValue').append( attr.$editVal ),
										$('<td />').html( getAttrDesc( attrName ) )
									)
								)
							}
						});
						$otherPlugins.append( 
								$('<table />')
								.addClass('table table-bordered table-striped')
								.append( 
									getTableHead(),
									$otherPluginTB
								)
						);
					}
				});
				
				
				// Check for flashvars: 
				var $fvBody = '';
				var $fvTbody = $('<tbody />');
				$.each( manifestData, function( attrName, attr){
					// check if we should skip the plugin
					if( attrName == pluginName || attr.attributes || attr.hideEdit ){
						return true;
					}
					if( $fvBody == '' ){
						$fvBody = $('<div />').append( $( '<b />').text( 'flashvars / uiConf vars:' ) );
					}
					attr.$editVal = $('<div />').getEditValue( attrName );
				
					$fvTbody.append(
						$('<tr />').append(
								$('<td />').text( attrName ),
								$('<td class="tdValue" />').append( attr.$editVal ),
								$('<td />').html( getAttrDesc( attrName ) )
							)
					);
				});
			
				if( $fvBody != '' ){
					$fvBody.append(
						$('<table />')
						.addClass('table table-bordered table-striped')
						.append( 
							getTableHead(),
							$fvTbody 
						)
					)
				} else {
					$fvBody = $();
				}
				
				// Check for flashvar callback; 
				var $updatePlayerBtn = flashvarCallback ? 
						$( '<a id="btn-update-player-' + id +'" class="btn disabled">' )
						.addClass('kdocUpdatePlayer')
						.text( 'Update player' )
						.click( function(){
							$.each( manifestData, function( pName, attr ){
								if( pName == pluginName || attr.attributes ){
									$.each( manifestData[pName].attributes, function( attrName, attr ){
										if( ! flashvars[ pName ] ){
											flashvars[ pName ] = {};
										}
										flashvars[ pName ] [ attrName ] = getAttrValue( attrName );
									} )
								} else {
									flashvars[ pName ] = attr.value;
								}
							});
							flashvarCallback( flashvars );
							// restore disabled class ( now that the player is up-to-date )
							$( this ).addClass( 'disabled')
				} ): $();
				
				return $('<div />').append( 
							$mainPlugin,
							$otherPlugins,
							$fvBody,
							$updatePlayerBtn,
							$('<p>&nbsp;</p>')
						)
				
			}
			function getFlashvarConfig(){
				var fvText = "flashvars: {\n";
				var mCount =0;
				$.each( manifestData, function( pName, attr ){
					mCount++;
				});
				var inx = 0;
				$.each( manifestData, function( pName, attr ){
					var coma = ',';
					inx++;
					if( inx == mCount ){
						coma = '';
					}
					if( manifestData[ pName ].attributes){
						fvText+="\t\"" + pName +'": {' + "\n";
						var aCount =0;
						$.each( manifestData[ pName ].attributes, function( attrName, attr ){
							if( getAttrValue( attrName) !== null ){
								aCount++;
							}
						});
						var aInx =0;
						$.each( manifestData[ pName ].attributes, function( attrName, attr ){
							if( getAttrValue( attrName) !== null ){
								var aComa = ',';
								aInx++;
								if( aInx == aCount ){
									aComa = '';
								}
								
								fvText += "\t\t\"" + attrName + '\" : ' + getJsonQuoteValue( attrName ) + aComa +"\n";
							}
						})
						fvText+= "\t}" + coma + "\n";
					} else {
						fvText += "\t\"" + pName + "\" : " + getJsonQuoteValue( pName ) + coma +"\n";
					}
				});
				fvText+="}\n";
				return $('<div />').append( 
							$('<pre class="prettyprint linenums" />').text( fvText ),
							$('<span>Flashvar JSON can be used with <a target="top" href="../../../docs/index.php?path=Embeding#kwidget">kWidget.embed</a>:</span>') 
						);
			}
			function getUiConfConfig(){
				var uiText = '';
				// add uiConf vars
				$.each( manifestData, function( pAttrName, attr ){
					if( manifestData[ pAttrName ].attributes ){
						uiText += '<Plugin id="' + pAttrName + '" ';
						$.each( manifestData[ pAttrName ].attributes, function( attrName, attr){
							if( attrName != 'plugin' && getAttrValue( attrName) !== null ){
								uiText+= "\n\t" + attrName + '="' +  getAttrValue( attrName )  + '" ';
							}
						});
						uiText +="\n/>\n";
						return true;
					}
					uiText += "\n" + '<var key="' + pAttrName + '" value="' + getAttrValue( pAttrName ) +'" />';
				});
				
				return $('<div />').append( 
						$('<pre class="prettyprint linenums" />').text( uiText ),
						$('<span>UiConf XML can be inserted via <a target="top" href="http://www.kaltura.org/modifying-kdp-editing-uiconf-xml">KMC api</a>:</span>') 
					);
			}
			function getPlayerStudioLine(){
				var plText ='';
				var and = '';
				// add top level flash vars: 
				$.each( manifestData, function( pAttrName, attr ){
					if( manifestData[ pAttrName ].attributes ){
						$.each( manifestData[ pAttrName ].attributes, function( attrName, attr){
							plText += and + pAttrName + '.' + attrName + '=' + getAttrValue( attrName );
							and ='&';
						})
						return true;
					}
					// else flat attribute:
					plText += and + pAttrName + '=' + getAttrValue( pAttrName );
					and ='&';
				});
				
				return $('<div />').append( 
						$('<pre />').text( plText ),
						$( '<span>Can be used with the player studio <i>"additional paramaters"</i> plug-in line</span>')
					)
			}
			
			
			// build the list of basevars
			var baseVarsList = '';
			$.each( flashvars, function( fvKey, fvValue ){
				baseVarsList+= fvKey + ',';
			})
			// get the attributes from the manifest for this plugin: 
			// testing files always ../../ from test
			var request = window.kDocPath + 'configManifest.php?plugin_id=' +
							pluginName + '&vars=' + baseVarsList;
			$.getJSON( request, function( data ){
				// check for error: 
				if( data.error ){
					$( _this ).html( data.error );
					return ;
				}
				
				manifestData = data;
				// merge in player config values into manifestData
				$.each( flashvars, function( fvKey, fvValue ){
					if( fvKey == pluginName  ){
						for( var pk in fvValue ){
							if( ! manifestData[ pluginName ].attributes[ pk ] ){
								manifestData[ pluginName ].attributes[ pk ] = {};
							}
							manifestData[ pluginName ].attributes[ pk ].value = fvValue[pk];
						}
						// continue
						return true;
					}
					// Check for prefixed vars ( pluginName.varKey )
					if( fvKey.indexOf( pluginName ) === 0 ){ 
						var fvParts = fvKey.split('.');
						manifestData[ pluginName ].attributes[ fvParts[1] ] = fvValue;
						// continue
						return true;
					} 
					if( typeof fvValue == 'object' ){
						for( var pk in fvValue ){
							if( ! manifestData[ fvKey ].attributes[ pk ] ){
								manifestData[ fvKey ].attributes[ pk ] = {};
							}
							manifestData[ fvKey ].attributes[ pk ].value = fvValue[pk];
						}
					} else {
						if( !manifestData[ fvKey ] ){
							manifestData[ fvKey ] = {};
						}
						manifestData[ fvKey ].value = fvValue;
					}
				});
				$textDesc = '';
				if( manifestData[ pluginName ] && manifestData[ pluginName ]['description'] ){
					$textDesc = $('<div />').html( manifestData[ pluginName ]['description'] );
				}
				
				function getEditTabs(){
					// output tabs:
					return $('<div class="tabbable tabs-left" />')
					.css('width', '800px')
					.append(
						$('<ul class="nav nav-tabs" />').append(
							'<li><a data-getter="getAttrEdit" href="#tab-docs-' + id +'" data-toggle="tab">edit</a></li>' +
							'<li><a data-getter="getFlashvarConfig" href="#tab-flashvars-' + id +'" data-toggle="tab">flashvars</a></li>' +
							'<li><a data-getter="getUiConfConfig" href="#tab-uiconf-' + id + '" data-toggle="tab">uiConf</a></li>' +
							'<li><a data-getter="getPlayerStudioLine" href="#tab-pstudio-'+ id +'" data-toggle="tab">player studio line</a></li>'
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-docs-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-flashvars-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-uiconf-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-pstudio-' + id + '" />')
						)
					)
				}
				/** 
				 * Outputs the settings file
				 */
				function getSettings(){
					$settings = $('<div>').append(
						'Global settings, will be saved to your browsers session.'
					);
					// Supports edit ks ( most important ) 
					var $tbody = $('<tbody />');

					function getInput( key ){
						var fullKey = 'kdoc-embed-' + key;
						return $('<input>')
						.data('key', fullKey)
						.attr('type',"text")
						.css("width","100px")
						.val( 
							localStorage[ fullKey ] ? localStorage[ fullKey ] : ''
						)
					}
					
					// ( if the pretty widget config was called with kWidget settings )
					$tbody.append(
						$('<tr>').append(
							$('<td>').text( 'Kaltura secret key'),
							$('<td>').append( 
								getInput( 'ks' )
							),
							$('<td>').html( "<b>Kaltura secret key</b> used for plugins that require a KS for authenticated actions." +
									"You can retive yours from <i>user</i> service, <i>login</i> action in the " +
									"<a target=\"_new\" href=\"http://www.kaltura.com/api_v3/testme/index.php\">kaltura api</a>" +
									"<br><i>Note:</i> You must set widget and entries to pull from your account to conduct respective admin actions"
							)
						)
					)

					// Supports setting diffrent "wid" / partner
					
					// Supports setting diffrent uiconf
					
					// Supports settings diffrent entryid ( where applicable )
					
					// Add the settings table:
					$settings.append(
						$('<table />')
						.addClass('table table-bordered table-striped')
						.append(
							getTableHead(),
							$tbody
						)
					)
					// Add the "save" button
					$settings.append(
						$( '<a id="btn-update-player-' + id +'" class="btn">' )
						.text( 'Save settigns' )
						.click(function(){
							var saveBtn = this;
							$settings.find('input').each(function( inx, input){
								// update respective local storage:
								localStorage[ $(input).data('key') ] = $(input).val();
							});
							// saved locally there is no cost ( but create appearnce of time passing )
							$(this).text('saving...').addClass('disabled');
							// update the embed player
							flashvarCallback( flashvars );
							// update the edit tabs:
							getAttrEdit();
							// just put in a timeout
							setTimeout(function(){
								$( saveBtn).text( 'Save settigns' ).removeClass( 'disabled' );
							},1000);
						}),
						$('<span>').text(' '),
						$( '<a id="btn-update-player-' + id +'" class="btn">' )
						.text( 'Clear settigns' )
						.click(function(){
							var clearBtn = this;
							$settings.find('input').each(function( inx, input){
								// update respective local storage:
								delete( localStorage[ $(input).data('key') ] );
								$(input).val('');
							});
							// cleared locally there is no cost ( but create appearnce of time passing )
							$(this).text('clearing...').addClass('disabled');
							// update the embed player
							flashvarCallback( flashvars );
							// update the edit tabs:
							getAttrEdit();
							// Clear settings
							setTimeout(function(){
								$( clearBtn).text( 'Clear settigns' ).removeClass( 'disabled' );
							},1000);
						})
					);

					return $settings;
				}
				
				var once = false;
				function showEditTab(){
					if( !once ){
						$( _this ).find( 'a[data-getter="getAttrEdit"]' ).click();
					}
					once = true;
				}
				var settingTabHtml = ( showSettingsTab ) ? 
						'<li><a data-getter="getSettings" href="#tab-settings-' + id +'" data-toggle="tab">Settings</a></li>' :
						'';
				$( _this ).empty().append(
					$('<div />')
					.css({
						'width': '800px',
						'margin-bottom': '10px'
					})
					.append(
						$('<ul class="nav nav-tabs" />').append(
							'<li><a href="#tab-desc-' + id +'" data-toggle="tab">Description</a></li>' +
							'<li><a data-getter="showEditTab" href="#tab-edit-' + id +'" data-toggle="tab">Integrate</a></li>' +
							settingTabHtml
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-desc-' + id + '" />').append( $textDesc ),
						 	$('<div class="tab-pane active" id="tab-edit-' + id + '" />').append( getEditTabs() ),
						 	$('<div class="tab-pane active" id="tab-settings-' + id + '" />')
						)
					)
					
				); 
				// setup show bindings
				$( _this ).find('a[data-toggle="tab"]').on('show', function( e ){
					// Check for data-getter:
					if( $( this ).attr( 'data-getter' ) ){
						$( $( this ).attr( 'href' ) ).html(
							eval( $( this ).attr( 'data-getter' ) + '()' )
						)
					}
					// make the code pretty
					window.prettyPrint && prettyPrint();
					// make sure ( if in an iframe ) the content size is insync:
					if( parent && parent['sycnIframeContentHeight'] ) {
						 parent.sycnIframeContentHeight();
					}
				});
				// show the first tab:
				$( _this ).find('.nav-tabs a:first').tab('show');
			});
			
		}); // each plugin closure
	}
})( jQuery );
