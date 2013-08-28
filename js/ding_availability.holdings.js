/**
 * @file
 * JavaScript behaviours for fetching and displaying holdings.
 */
(function($) {
  Drupal.behaviors.dingAvailabilityHoldingsAttach = {
    attach: function(context, settings) {
      var ele = $('.ting-item-holdings');
      var ids = new Array(ele.length);
      var run_request = false;

      $(ele, context).once('ajax-holdings', function(i, e) {
        var match = $(e).attr('class').match(/holdings-([\w\d]+)/);
        ids[i] = match[1];
        run_request = true;
      });

      // Fetch availability.
      if (run_request) {
        var url = settings.basePath + settings.pathPrefix + 'ding_availability/holdings/' + ids.join(',');

        $.ajax({
          type: 'get',
          url: url,
          dataType: 'json',
          success: function(response) {
            $.each(response, function(i, e) {
              if (e.html !== undefined) {
                $('.ting-item-holdings.holdings-' + i).append('<h2>' + Drupal.t('Status for the material') + '</h2>').append(e.html);
              }
            });
          }
        });
      }
    }
  };

})(jQuery);
