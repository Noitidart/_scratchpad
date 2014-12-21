//CustomizableUI.destroyWidget('search-container_clone_');
///*
Cu.import('resource:///modules/CustomizableUI.jsm');
CustomizableUI.createWidget({
	id: 'search-container_clone___',
	type: 'custom',
	removable: true,
	defaultArea: CustomizableUI.AREA_NAVBAR,
	onBuild: function(aDocument) {
		var node = aDocument.createElement('toolbaritem');
    node.setAttribute('id', this.id);
    
    var props = {
      title: 'Search',
      align: 'center',
      class: 'chromeclass-toolbar-additional panel-wide-item',
      flex: 100
    };
    for (var p in props) {
      node.setAttribute(p, props[p])
    }
    
    var searchbar = aDocument.createElement('textbox');
    node.appendChild(searchbar);
    
		//node.style.listStyleImage = "url(" + (aProvider.icon32URL || aProvider.iconURL) + ")";
		return node;
	}
});
//*/
