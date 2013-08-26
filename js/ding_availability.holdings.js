/**
 * @file
 * JavaScript behaviours for fetching and displaying holdings.
 */
(function($) {
  Drupal.behaviors.dingAvailabilityHoldingsAttach = {
    attach: function(context, settings) {
      var item_type = $('.ting-item-holdings');
      var ids = new Array(item_type.length);

      item_type.each(function(i, e) {
        var match = $(e).attr('class').match(/holdings-(\d+)/);
        ids[i] = match[1];
      });

      // Fetch availability.
      if (ids.length > 0) {
        var url = settings.basePath + settings.pathPrefix + 'ding_availability/holdings/' + ids.join(',');

        $.ajax({
          type: 'get',
          url: url,
          dataType: 'json',
          success: function(response) {
            $.each(response, function(i, e) {
              if (e.html != undefined) {
                $('.ting-item-holdings.holdings-' + i).append(e.html);
              }
            });
          }
        });
      }
    }
  };

})(jQuery);
