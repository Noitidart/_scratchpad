var me = Services.wm.getMostRecentWindow(null);
var hs = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

var databaseStatus = hs.databaseStatus;
switch (databaseStatus) {
  case hs.DATABASE_STATUS_OK:
    var result = 'Database did already exist and has been correctly initialized.';
    break;
  case hs.DATABASE_STATUS_CREATE:
    var result = 'Database did not exist, a new one has just been created and initialized.';
    break;
  case hs.DATABASE_STATUS_CORRUPT:
    var result = 'Database was corrupt, has been moved to a .corrupt file and a new one has been created and initialized.';
    break;
  case hs.DATABASE_STATUS_UPGRADED:
    var result = 'Database had an old schema version and has been upgraded to a new one.';
    break;
}

me.alert(result)

  var query = hs.getNewQuery();
  var options = hs.getNewQueryOptions();

  // Query users bookmarks, not history
  options.queryType = options.QUERY_TYPE_BOOKMARKS;
  // Execute the search and store results
  var result = hs.executeQuery(query, options);

  // Open the root containerNode and open it
  var resultContainerNode = result.root;
 // OPEN resultContainerNode
  resultContainerNode.containerOpen = true;
  // Search results are now child items of this container?
  for (var i=0; i < resultContainerNode.childCount; ++i) {
    var childNode = resultContainerNode.getChild(i);
    if (childNode.type == childNode.RESULT_TYPE_URI) {
       console.log('childNode ' + i + ' is url = ', childNode)
       console.log('times visited = ', childNode.accessCount)
    }
    if (i >= 10) { break }
  }

  // CLOSE resultContainerNode
  resultContainerNode.containerOpen = false;
