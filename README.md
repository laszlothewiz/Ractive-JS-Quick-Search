Ractive-JS-Quick-Search
=======================

General Purpose Quick Search Input Field Implementation with Ractive JS

Recently, I needed to implement a way to select names from the a large(r) client database. The best solution is to have an input field where you type in a few letters and then you will be presented with a list of names that contain that string you just typed.

While, this kind of input is very commonly seen everywhere, I could not find a simple, pluggable implementation. So I created it using Ractive.js which is a phenomenal framework to create interactive web apps. With that I could create a plugin, that is just a single file and contains everything that is needed to easily implement a quick search box.

### Dependencies:
- Ractive.js 0.6+
- jQuery 1.5+  (it is needed to implement the moving focus to the next tab stop)

## How to Use
### Load the needed libraries
```HTML
<script src="ractive.js"></script>
<script src="jquery.js"></script>
<script src="quick-search.js"></script>  
```
### Add it to your template
```HTML
<SCRIPT id='mainTempl' type='text/ractive'>
  Select a name: <qselect store="{{selected}}" on-search="searchName" />
</SCRIPT>
<DIV id="here"></DIV>
```
`qselect` is just a made up name, you can name your HTML tag any way you want.

Parameters for the HTML tag:
- `store`: has to be a two-way bound variable on your Ractive instance. Specifies where the selected item going to be stored
- `on-search`: the event that is going to get called when sufficient number of letters are typed in and the user stopped typing
- `search-delay`: (optional) the number of milliseconds to wait after a keypress before the search event is fired. It prevents too frequent requests when the user is typing several characters in a row. Default: 400
- `msg-search`: (optional) the message that is to be displayed when the search is invoked but no results yet. Default: "Searching..."
- `msg-notfound`: (optional) message to diplay when the search didn't turn up any results. Default: "No results found for:"
- `min-length`: (optional) The minimum number of characters required before searching is invoked. Default: 3

### Include it in your Ractive instance
```Javascript
var mainCtr=new Ractive({
	el: 'here',    //element with the id="here"
	template: '#mainTempl',
	data: {
		selected: []   //this is where we get the result of the selection
	},
	components: {
		qselect: Ractive.quickSearch    //the property name (`qselect`) determines the name of the HTML tag
	}
})

//defining the search event handler
//this is using an Ajax call to a server but pure JS search from a table can be implemented as well
mainCtr.on("searchName",function(ev,query,callback){
	$.getJSON("/findname/"+encodeURIComponent(query),function(res){
		var fRes=[] //formatted result
		res.forEach(function(item){  //converting the result to the format that the callback function expects
			fRes.push([item.id,item.name])
		})
		callback(fRes);
	})	  
})
```
### The search event
This will need a bit of explanation.

The event handler get three parameters:
- event object: discarded
- query: a string for which the search needs to be executed for
- callback: the callback function that needs to be called once the results are in. it expects the results in the following format: [[id1,name1],[id2,name2],...]

The selection is designed to work with an [id,name] pair. The `name` is what going to be displayed to the user and when he selects it the [id,name] pair will be stored in the specified variable. This allows the template and the rest of the JS code to easily work with it.

For example: a client is selected from the database by name. After the selection the an AJAX call can be made to pull in the full record of that selected client using the ID.

> If anybody has a better idea on the data arrangement please let me know.

### The input behavior
When the input box gets the focus and the user types in the sufficient number of letters then the search is executed and the results are displayed under the input box in a table format.

The user can use the up and down arrows on the keyboard to move the selection between the search results. `Tab` or `Enter` finalizes the selection. If there's only one search results and the `Enter` is pressed then that result gets accepted regardless it was selected or not. `Tab` only finalizes the selection if there's an active selection.

Mouse click on a search result finalizes the selection.

`Esc` clears out the (non-finalized) selection made by the up or down arrows.

If the input box loses focus then the search results are hidden but will re-appear when the focus is received again.

### Multiple Quick Search elements on one page
The plugin is written in such a way that all working data of an instance is encapsulated, so you can have multiple Quick Search inputs on your page (webapp)

### Things to watch for
Ractive.js has not fully implemented the lower-case conversion of HTML elements yet. So the parameters in the HTML tag need to be all lower-case, otherwise you might just scratch your head and wonder "why doesn't it work?"

### Live example
The best way to understand this is too see it in operation

I haven't got around to this yet but it's coming soon...

### TODOs
- locking/unlocking of the input field: once the selection is made the input should be locked with an option to clear out the selection and select another record
- Find a better solution to moving the focus to the next tabbable element, without jQuery is possible
- Nicer selection when using the up and down arrows
- implement special handlings for the `class` and `id` properties in the HTML tag
