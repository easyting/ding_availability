/**
 * @file ding.availability.js
 * JavaScript behaviours for fetching and displaying availability.
 */

(function($) {

  // Cache of fetched availability information.
  Drupal.DADB = {};

  Drupal.behaviors.dingAvailabilityAttach = {
    attach: function(context, settings) {
      var ids = [];
      var html_ids = [];
      $.each(settings.ding_availability, function(id, entity_ids) {
        $.each(entity_ids, function(index, entity_id) {
          if (Drupal.DADB[entity_id] === undefined) {
            Drupal.DADB[entity_id] = null;
            ids.push(entity_id);
            html_ids.push(id);
          }
        });
      });

      $.each(html_ids, function(index, id) {
        $('#' + id).addClass('pending');
      });

      // Fetch availability.
      if (ids.length > 0) {
        var url = settings.basePath + settings.pathPrefix + 'ding_availability/' + (settings.ding_availability_mode ? settings.ding_availability_mode: 'items') + '/' + ids.join(',');
        $.getJSON(url, {}, function (data, textData) {
          $.each(data, function(id, item) {
            // Update cache.
            Drupal.DADB[id] = item;
          });

          update(true);
        });
      }

      update(false);

      // end of initialization.

      function update(update_holdings) {
        $.each(settings.ding_availability, function(id, entity_ids) {
          if (id.match(/^availability-/)) {
            var status = ding_status(entity_ids);
            // Update availability indicators.
            updateAvailability(id, status);
            updateReservation('reservation-' + entity_ids[0], status);
          }
          else {
            // Update holding information.
            if (update_holdings) {
              updateHoldings(id, entity_ids);
            }
          }
        });
      }

      function updateAvailability(id, status) {
        $('#' + id).removeClass('pending');
        $('#' + id).addClass('processed');

        if (status.raw.available) {
          $('#' + id).addClass('available');
        }
        if (status.raw.reservable) {
          $('#' + id).addClass('reservable');
        }

        if (status.available) {
          $('#' + id).attr('title', Drupal.t('available'));
        }
        else if (status.onloan) {
          $('#' + id).attr('title', Drupal.t('on loan'));
        }
        else if (status.not_reservable) {
          $('#' + id).attr('title', Drupal.t('not reservable'));
        }
        else if (status.unavailable) {
          $('#' + id).attr('title', Drupal.t('unavailable'));
        }
      }

      function updateReservation(id, status) {
        if (status.show_reservation_button) {
          var local_id = id.match(/^reservation-(.+)/);
          $('#' + id)
            .removeClass('hidden')
            .attr('id', 'processed-' + id)

          // Display reservation button for the collection.
          $('.reservation-link-ajax.hidden.for-item-' + local_id[1] + ', .page-ting-collection .field-type-ting-primary-object .reservation-link-ajax.hidden')
            .removeClass('hidden');
        }
      }

      function updateHoldings(id, entity_ids) {
        var entity_id = entity_ids.pop();

        if (Drupal.DADB[entity_id] != undefined && Drupal.DADB[entity_id].html != undefined && Drupal.DADB[entity_id]['holdings'].length > 0) {
            $('#' + id).append('<h2>' + Drupal.t('Status for the material') + '</h2>');
            $('#' + id).append(Drupal.DADB[entity_id].html);
        }
        // if no html is given; this is exceptional situation.
        else if (Drupal.DADB[entity_id] == undefined || Drupal.DADB[entity_id]['holdings'].length == 0) {
          $('#' + id).append('<h2>' + Drupal.t('No holdings available') + '</h2>');
        }
      }

      // Helper method to compute statuses.
      function ding_status(ids) {
        var available = false;
        var reservable = false;
        var show_reservation_button = false;
        $.each(ids, function(index, entity_id) {
          if (Drupal.DADB[entity_id]) {
            available = available || Drupal.DADB[entity_id]['available'];
            reservable = reservable || Drupal.DADB[entity_id]['reservable'];
            show_reservation_button = show_reservation_button || Drupal.DADB[entity_id]['show_reservation_button'];
          }
        });

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
      };

    }
  };

})(jQuery);
