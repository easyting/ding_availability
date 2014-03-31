DingAvailability = {
  running: false,
  availability_cache: {},
  holdings_cache: {},
  queue: [],
  max_process: 20
};

/**
 * Get data from server and process it.
 *
 * @param string type
 *  Type of availability info. Possible values: availability, holdings.
 * @param array ids
 *  Ting object ids.
 * @param callback
 *  Callback function, takes id, data as parameters.
 */
DingAvailability.process = function (type, ids, callback) {
  // Already running so queue.
  if (DingAvailability.running) {
    DingAvailability.queue.push({type: type, ids: ids, callback: callback});
    return;
  }

  // Limit number of items to process per call.
  if (ids.length > DingAvailability.max_process) {
    var queue = ids.slice(DingAvailability.max_process);
    ids = ids.slice(0, DingAvailability.max_process);
    DingAvailability.queue.push({type: type, ids: queue, callback: callback});
  }

  DingAvailability.running = true;
  var i;
  for (i = 0; i < ids.length; i++) {
    // Call callback for already cached item.
    if (typeof(DingAvailability[type + "_cache"][ids[i]]) != 'undefined') {
      callback(ids[i], DingAvailability[type + "_cache"][ids[i]]);
      ids.splice(i, 1);
    }
  }

  if (ids.length > 0) {
    // Get data from server.
    var url = Drupal.settings.basePath + Drupal.settings.pathPrefix
      + 'ding_availability/' + type + '/' + ids.join(',');

    jQuery.ajax({
      url: url,
      dataType: 'json',
      success: function(response) {
        for (var i = 0; i < ids.length; i++) {
          if (response[ids[i]] !== undefined) {
            DingAvailability[type + "_cache"][ids[i]] = response[ids[i]];
            callback(ids[i], DingAvailability[type + "_cache"][ids[i]]);
          }
        }
        DingAvailability.running = false;
        DingAvailability.processQueue();
      },
      error: function () {
        DingAvailability.running = false;
        DingAvailability.processQueue();
      }
    });
  }
};

DingAvailability.processQueue = function () {
  if (DingAvailability.queue.length > 0) {
    var item = DingAvailability.queue.pop();
    DingAvailability.process(item.type, item.ids, item.callback);
  }
};
