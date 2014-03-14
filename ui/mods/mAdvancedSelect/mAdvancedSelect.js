var mAdvancedSelect_core=function(){
with(this){
	var COBJ=this;
	
	// apply keybinds
	this.apply_keybinds=function(used_keybinds,conflicts,resolve){
        var set = 'mAdvancedSelect';        
        var defaults = default_keybinds[set];
        var key;
        var action;
        var binding;
      
        //fix for chrome stuff, check hotbuild2 for changes
        var squelch = function (e) {
            if (e.preventDefault){
              e.preventDefault();
            }
            return false;
        };
        Mousetrap.bind('backspace', squelch);
        
        //cycle through keys in action_sets
        for(key in action_sets[set]){
            action=action_sets[set][key];
            binding=defaults[key];
            
            //if a binding for this exists in stored settings, grab it
            if(localStorage['keybinding_'+key]!==undefined){
            	binding=decode(localStorage['keybinding_'+key]);
            }
            
            //apply binding to both lower and uppercase
			binding=[binding,'shift+'+binding];
			Mousetrap.bind(binding,_.partial(function(callback,event,binding){
				callback(event,binding);
				event.preventDefault();
			},action));

        }
	};
	
	// prepare keys
	this.prepare_keys=function(){
		action_sets.mAdvancedSelect = {};
		action_sets.mAdvancedSelect['Select Air'] = function (event) { };
		action_sets.mAdvancedSelect['Select Land'] = function (event) { };
		action_sets.mAdvancedSelect['Select Naval'] = function (event) { };
		action_sets.mAdvancedSelect['Select Orbital'] = function (event) { };
		action_sets.mAdvancedSelect['Select Excluded'] = function (event) { };
		
		// default keybinds
		default_keybinds.mAdvancedSelect = {};
		default_keybinds.mAdvancedSelect['Select Air'] = '';
		default_keybinds.mAdvancedSelect['Select Land'] = '';
		default_keybinds.mAdvancedSelect['Select Naval'] = '';
		default_keybinds.mAdvancedSelect['Select Excluded'] = ''; 
		default_keybinds.mAdvancedSelect['Select Orbital'] = '';
	};
	
	// register keys with functions
	this.hook_keys=function(){
		action_sets.mAdvancedSelect['Select Air']=function(event){ 		console.log('YO! AIR');COBJ.filter_select('air');}
		action_sets.mAdvancedSelect['Select Land']=function(event){ COBJ.filter_select('land');}
		action_sets.mAdvancedSelect['Select Naval']=function(event){ COBJ.filter_select('naval');}
		action_sets.mAdvancedSelect['Select Orbital']=function(event){ COBJ.filter_select('orbital');}
		action_sets.mAdvancedSelect['Select Excluded']=function(event){ COBJ.filter_select_history();}
	};
	
	// given a selectionList-array, return the array without _type
	this.filter_apply_exclude=function(_type,_list){
		var ret=new Array();
		for(var i in _list){
			var l_item=_list[i];
			if(l_item.type.indexOf('/'+_type+'/')<0){
				ret.push(l_item.type);
			}
		}
		return ret;
	};

	// filter the active selection
	this.filter_select=function(_type){
		var s_list=model.selectionList();
		// units are selected, overide default behavior
		if(s_list.length>0){
			var s_filter_exclude=COBJ.filter_apply_exclude(_type,s_list);
			//set capture group to recall selection
			api.select.captureGroup(99);			
			model.holodeck.view.selectByTypes("remove", s_filter_exclude);
		}
		//no units are selected, apply screen-wide filter
		else{
			switch (_type){
				case 'land':
		   			engine.call("select.allLandCombatUnitsOnScreen");
		   			return true;
				case 'air':
					engine.call("select.allAirCombatUnitsOnScreen");
					return true;
				case 'naval':
					engine.call("select.allNavalCombatUnitsOnScreen");
					return true;
				case 'orbital':
					mEvents.register_callback('selection',function(_data){
	   					var s_filter_exclude=COBJ.filter_apply_exclude(_type,model.selectionList());
			   			model.holodeck.view.selectByTypes("remove", s_filter_exclude);
					});
					var result=engine.call("select.allCombatUnitsOnScreen");
					return true;
			}
		}
	};
	
	// recall the last pre-filter selection, but invert to all EXCLUDED models#
	this.filter_select_history=function(){
		api.select.recallGroup(99);
	};
}
};
var mAdvancedSelect=new mAdvancedSelect_core();