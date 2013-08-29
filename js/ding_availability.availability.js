/**
 * @file
 * JavaScript behaviours for fetching and displaying availability.
 */
(function($) {
  Drupal.behaviors.dingAvailabilityAttach = {
    attach: function(context, settings) {
      var ele = $('.ting-item-type');
      var ids = new Array(ele.length);
      var run_request = false;

      $(ele, context).once('ajax-availability', function(i, e) {
        var match = $(e).addClass('pending').attr('class').match(/availability-([\w\d]+)\s/);
        ids[i] = match[1];
        run_request = true;
      });

      // Fetch availability.
      if (run_request) {
        var url = settings.basePath + settings.pathPrefix + 'ding_availability/availability/' + ids.join(',');

        $.ajax({
          type: 'get',
          url: url,
          dataType: 'json',
          success: function(response) {
            ele.removeClass('pending').addClass('processed');

            var status = null;
            $.each(response, function(i, e) {
              status = setDingStatus(e);
              updateAvailability(i, status);
            });
          }
        });
      }

      /**
       * Set the actual availability class for element.
       */
      function updateAvailability(id, status) {
        var ele = $('.ting-item-type.availability-' + id);

        ele.removeClass('pending');
        ele.addClass('processed');

        if (status.raw.available) {
          ele.addClass('available');
        }
        if (status.raw.reservable) {
          ele.addClass('reservable');
        }

        if (status.available) {
          ele.attr('title', Drupal.t('available'));
        }
        else if (status.onloan) {
          ele.attr('title', Drupal.t('on loan'));
        }
        else if (status.not_reservable) {
          ele.attr('title', Drupal.t('not reservable'));
        }
        else if (status.unavailable) {
          ele.attr('title', Drupal.t('unavailable'));
        }
      }

      /**
       * Compute the item status.
       */
      function setDingStatus(ele) {
        var available = false;
        var reservable = false;
        var show_reservation_button = false;

        available = available || ele['available'];
        reservable = reservable || ele['reservable'];
        show_reservation_button = show_reservation_button || ele['show_reservation_button'];

        return {
          raw: {
            available: available,
            reservable: reservable
          },
          available: available && reservable,
          onloan: !available && reservable,
          not_reservable: available && !reservable,
          unavailable: !available && !reservable,
          show_reservation_button: show_reservation_button
        };
      }
    }
  };

})(jQuery);
