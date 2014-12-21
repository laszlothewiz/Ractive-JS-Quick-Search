/*Generalized quicksearch plugin using Ractive.js

Dependencies:
- Ractive.js 0.6+
- jQuery 1.5+

Version: 0.5
Author: Laszlo Szenes
Date: 2014-12-21
*/


//TODO: locking/unlocking of the input field

//adding it to the Ractive global object
Ractive.quickSearch= Ractive.extend({
	template: '<DIV class=quick-search>\
      <INPUT on-keydown="keyNav" on-focus="inout:1" on-blur="inout:0" value="{{Q}}" />\
        <SPAN style="{{show ? \'\' : \'display:none\'}}">{{{msg}}}</SPAN>\
        <UL style="{{show ? \'\' : \'display:none\'}}">{{#each sRes:idx}}\
        <LI on-click="qsSelect:{{idx}}" class={{ selected==idx ? "selected" : ""}}>{{.name}}\
      {{/each}}</UL>\
    </DIV>',
	data: { 
		Q : '',
		sRes: [],  //search results
		selected: -1,
		show: false,
		defaults: {
			"msg-search":"Searching...",
			"search-delay":400,
			"msg-notfound":"No results found for:",
			"min-length":3,
		},
	},
	isolated: true,  //create own "data bubble"
	oninit: function(){
		//saving references for the closures
		var QS=this;  
		window.debugQS=QS
		var Data=this.data

		//setting up the default values for the configurations
		for (var key in Data.defaults) {
			if(!Data[key]){
				Data[key]=Data.defaults[key]
			}
		}

		//performing a search function by firing the search event defined in the parent
		var search= function(){
			QS.fire("search",0,Data.Q,
			  function(found){  //callback function should be provided data in [[value,name], ...] format
				var x=Data.sRes;
				while(x.length > 0) { x.pop(); }  //cleaning out old search results.
				found.forEach(function(item){
					x.push({val:item[0],name:item[1]})
				})
				if(x.length==0) {
					Data.msg='<B>'+Data['msg-notfound']+' '+Data.Q+'"</B>'  
				} else {Data.msg=""}
				Data.selected=-1
				QS.update()
			})
		}

		QS.on('keyNav',function(ev){
			//console.log(ev.original.keyCode)
			var preventDef=true
			//console.log(ev)
			switch(ev.original.keyCode){
				case 38: //up
					if(Data.selected>-1) Data.selected--
						else Data.selected=Data.sRes.length-1;
					break;
				case 40: //down
					if(Data.selected<Data.sRes.length) Data.selected++
						else Data.selected=0;
					break;
				case 13: //enter
					if(Data.sRes.length==1){  //if there's only one result then that gets accepted
						Data.selected=0
					}
				case 9:  //tab
					QS.fire('qsSelect',0,Data.selected)
					$(ev.node).tabStop().focus()   //TODO:make this a reference to an outside function
					break;
				case 27: //esc
					Data.selected=-1
					break;			
				default:
					preventDef=false
			}
			if(preventDef) {
				ev.original.preventDefault();
				QS.update();
			}
		});  //end of .on('keyNav')

		//handling the focus and blur events
		QS.on('inout',function(ev,io){
			if(io){  //when the <input> gets the focus
				Data.show=true
				QS.update()
			} else {
				setTimeout(function(){
					Data.show=false
					QS.update()
				},100)
			}
		})

		QS.on('qsSelect',function(ev,idx){
			if(idx<0 || idx >= Data.sRes.length) return
			Data.Q=Data.sRes[idx].name
			Data.store=[Data.sRes[idx].val,Data.Q]  //updating the parent element via two way binding
			QS.update()
		})

		//watching for changes on the typed in data
		QS.observe('Q',function(newV){
			if(Data.timeout) {clearTimeout(Data.timeout);Data.timeout=0}
			if(newV.length<Data['min-length']) {  //if less then `min-length` characters then clear out the search results and invalidate the selection
				while(Data.sRes.length > 0) { Data.sRes.pop(); }
				Data.selected=-1
				return
			}
			Data.timeout=setTimeout(function(){
				search();   //calling the async search function
				Data.msg=Data['msg-search']  
				QS.update();
			},Data['search-delay'])
		})  //end of .observe('Q'...)
	}
})  //end of Ractive.extend

//creating the necessary styles
if(!document.getElementById('qs-css')){
	document.write('<style id="qs-css">\
.quick-search UL {\
	position: absolute;\
	margin:0;\
	padding:0;\
	background: #fff;	\
	list-style: none;\
}\
\
.quick-search UL LI {\
	border: 1px solid #000;\
	padding: 3px;\
}\
.quick-search UL LI:hover {\
	background: #ff8;\
	display: block;\
	cursor: pointer;\
}\
\
.quick-search LI.selected {\
	border: 2px solid #f00;\
}\
\
.quick-search SPAN {\
	position: absolute;\
	background: #fff;\
	margin: 3px;\
}\
	</style>')
}

//jQuery Tabstop plugin by Berengar W. Lehr
!function(t){t.fn.tabStop=function(e){var n='[tabindex]:not([tabindex^="-"])',i='a[href],link[href],button,input:not([type="hidden"]),select,textarea,menuitem,[draggable="true"]',a="[tabindex],[disabled]",d=t(n).get().sort(function(t,e){return e.getAttribute("tabindex")-t.getAttribute("tabindex")}).concat(t("body").find(i).not(a).get());return t(d[(d.indexOf(this.get(0)||document.activeElement)+(0>e?d.length-1:1))%d.length])}}(jQuery);
