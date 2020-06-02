export var modelGlobal = 1;

export const setModel = function(model){
    console.log('set')
    modelGlobal = model;
}

export const getModel = function(){
    return modelGlobal;
}