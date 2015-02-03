// from: https://github.com/Noitidart/js-macosx/blob/c2644170c4e2e221d1d41c769ce8091f35f7d0ac/modules/macosx.js#L649
var importFramework = function __macosx_import_framework(name_or_path, include_dependencies, bridge_support_path, extra_lib_path) {
    var file_name = OS.Path.basename(name_or_path);
    var name = file_name.split(".")[0];
    var path = OS.Path.dirname(name_or_path);
    if (path===".") path="/System/Library/Frameworks";
    if (name) {
        var framework = {lib: null, extra_lib: null};
        framework.framework_path = path+"/"+((file_name===name)?(name+".framework"):file_name);
        framework.lib_path = framework.framework_path+"/"+name;
        framework.bridge_support_path = bridge_support_path||(framework.framework_path+"/Resources/BridgeSupport/"+name+".bridgesupport");
        framework.extra_lib_path = extra_lib_path||(framework.framework_path+"/Resources/BridgeSupport/"+name+".dylib");
      console.log('framework', framework)
        //this.frameworks[name] = new Proxy(framework, __framework_proxy);
        //return this.loadBridgeSupport(this.frameworks[name], include_dependencies);
    }
}
importFramework('Foundation', false)