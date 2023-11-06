/* Copyright 2017, Chris Youderian, SimpleMaps, http://simplemaps.com
 Released under MIT license - https://opensource.org/licenses/MIT 
 */ 
(function(plugin){
  
  //Start helper functions
    //IE8 support for index of
    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(needle) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    return i;
                }
            }
            return -1;
        };
    }  
    //docReady in pure JavaScript, source: https://github.com/jfriend00/docReady/blob/master/docready.js, MIT
    (function (funcName, baseObj) {funcName = funcName || "docReady";baseObj = baseObj || window;var readyList = [];var readyFired = false;var readyEventHandlersInstalled = false;function ready() {if (!readyFired) {readyFired = true;for (var i = 0; i < readyList.length; i++) {readyList[i].fn.call(window, readyList[i].ctx);}readyList = [];}}function readyStateChange() {if (document.readyState === "complete") {ready();}}baseObj[funcName] = function (callback, context) {if (readyFired) {setTimeout(function () {callback(context);}, 1);return;} else {readyList.push({fn:callback, ctx:context});}if (document.readyState === "complete" || !document.attachEvent && document.readyState === "interactive") {setTimeout(ready, 1);} else if (!readyEventHandlersInstalled) {if (document.addEventListener) {document.addEventListener("DOMContentLoaded", ready, false);window.addEventListener("load", ready, false);} else {document.attachEvent("onreadystatechange", readyStateChange);window.attachEvent("onload", ready);}readyEventHandlersInstalled = true;}};})("docReady", window);
  //End helper functions
  
  window[plugin]=function(){
    return {
      map: false,
      on_shift: false,
      selected_color: false,      
    }
  }()  
    
  docReady(function(){
    var me=window[plugin];
    var map=me.map?me.map:simplemaps_usmap; //usmap is default
    var on_shift=me.on_shift;
    var selected_color=me.selected_color?me.selected_color:map.mapdata.main_settings.state_hover_color;
    var selected=[]; 
    var max=me.max?me.max:false;
    var original_mapdata=JSON.parse(JSON.stringify(map.mapdata));
    var main_settings=map.mapdata.main_settings;
    
    function check_mapdata(state){ //make sure a color exists for each state
        if (!map.mapdata.state_specific[state]){map.mapdata.state_specific[state]={};}         
        if (!original_mapdata.state_specific[state]){original_mapdata.state_specific[state]={}; original_mapdata.state_specific[state].color='default'}      
        else if (!original_mapdata.state_specific[state].color){original_mapdata.state_specific[state].color='default'}
    }
    
    var deselect=function(state){
        map.states[state].stop(); //prevents fade time from interfering with deselect
        var index=selected.indexOf(state);        
        if (index > -1){ //deselect state
          selected.splice(index, 1);   
          check_mapdata(state);
          map.mapdata.state_specific[state].color=original_mapdata.state_specific[state].color;
        }    
        done(state);
    }
    
    var check_max=function(state){
      if (me.max && selected.length>=me.max){
        var first=selected[0];
        me.deselect(first);
      }      
    }
    
    var select=function(state){
      var index=selected.indexOf(state);        
      if (index < 0){ //make sure a state is selectedable
        check_mapdata(state);
        check_max();
        map.mapdata.state_specific[state].color=me.selected_color;
        selected.push(state);
        done(state);
      }      
    }
    
    var select_all=function(){
      for (var state in simplemaps_usmap_mapinfo.paths){
        select(state);
      }
    }
    
    var deselect_all=function(){
      var length=selected.length
      for (var i = 1; i < length+1; i++){
        var id=length-i
        var state=selected[id];
        deselect(state);
      }
    }    
    
    function done(state){
        map.refresh_state(state);
        me.selected=selected; //update value        
    }
  
    var upon_click = function(state, e){   
      if (me.on_shift){ //select on shift+click
        var evt = e || w.event;
        var length=me.selected.length;
        var index=me.selected.indexOf(state);  
        var last_state=me.selected[length-1];
        if (length == 0){
            me.select(state);
        }        
        else if (length > 0){
          if(evt.shiftKey){
            if (index > -1){
              me.deselect(state);
            }
            else{
              me.select(state);
            }
          }
          else{ 
            me.deselect_all(last_state);
            me.select(state);
          }
        }        
      }
      else{ //select on click
        var index=selected.indexOf(state);   
        if (index > -1){ //deselect state
          deselect(state);
        }
        else{ //select state
          select(state);
        }
      }
    }
    
    map.plugin_hooks.click_state.push(upon_click);   
    
    window[plugin]=function(){
      return {
        //inputs
        map:map,
        on_shift: on_shift,
        selected_color: selected_color,
        max: max,
        //outputs
        selected: selected, 
        //methods
        select: select,
        deselect: deselect,
        select_all: select_all,
        deselect_all: deselect_all      
      } 
    }()    
    
    me=window[plugin];
  
  });
  
})('simplemaps_select'); //change plugin name to use across multiple maps on the same page
