<?php

/**
 * @file
 * Field hook implementations.
 */

/**
 * Implements hook_field_info().
 */
function ding_availability_field_info() {
  return array(
    'ding_availability_item' => array(
      'label' => t('Availability information.'),
      'description' => t('Availability information.'),
      'default_widget' => 'hidden',
      'default_formatter' => 'ding_availability_default',
      'no_ui' => TRUE,
    ),
    'ding_availability_holdings' => array(
      'label' => t('Holdings information.'),
      'description' => t('Holdings information.'),
      'default_widget' => 'hidden',
      'default_formatter' => 'ding_availability_default',
      'no_ui' => TRUE,
    ),
  );
}

/**
 * Implements hook_field_load().
 */
function ding_availability_field_load($entity_type, $entities, $field, $instances, $langcode, &$items, $age) {
  foreach ($entities as $id => $entity) {
    $items[$id][0] = array(
      'provider_id' => $entity->localId,
    );
  }
}

/**
 * Implements hook_widget_info_alter().
 */
function ding_availability_widget_info_alter(&$info) {
  if (isset($info['hidden'])) {
    $info['hidden']['field types'][] = 'ding_availability_item';
    $info['hidden']['field types'][] = 'ding_availability_holdings';
  }
}

/**
 * Implements hook_field_formatter_info().
 */
function ding_availability_field_formatter_info() {
  return array(
    'ding_availability_default' => array(
      'label' => t('Default'),
      'field types' => array(
        'ding_availability_item',
        'ding_availability_holdings',
      ),
    ),
    'ding_availability_type' => array(
      'label' => t('With availability information'),
      'field types' => array(
        'ting_type',
      ),
    ),
    'ding_availability_types' => array(
      'label' => t('With availability information'),
      'field types' => array(
        'ting_collection_types',
      ),
    ),
  );
}

/**
 * Implements hook_field_formatter_view().
 */
function ding_availability_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = array();
  foreach ($items as $delta => $item) {
    switch ($field['type']) {
      // Holdings table.
      case 'ding_availability_holdings':
        $element[$delta] = array(
          '#markup' => ($entity->type !== 'Tidsskrift') ? '<div class="ting-item-holdings holdings holdings-' . $entity->localId . '"></div>' : '',
          '#attached' => array(
            'js' => array(
              drupal_get_path('module', 'ding_availability') . '/js/ding_availability.holdings.js',
            ),
          ),
        );
        break;
      // Unknown purpose.
      case 'ding_availability_item':
        $element[$delta] = array(
          '#markup' => '<div class="availability availability-' . $item['provider_id'] . '"></div>',
        );
        break;
      // Item page usage.
      case 'ting_type':
        $element[$delta] = array(
          '#theme' => 'item_list',
          '#items' => array(
            array(
              'data' => $entity->type,
              'class' => array('ting-item-type availability availability-' . $entity->localId, drupal_html_class($entity->type)),
            ),
          ),
         '#attached' => array(
            'js' => array(
              drupal_get_path('module', 'ding_availability') . '/js/ding_availability.availability.js',
            ),
            'css' => array(
              drupal_get_path('module', 'ding_availability') . '/css/ding_availability.css',
            ),
          ),
        );
        break;
      // Search result usage.
      case 'ting_collection_types':
        foreach ($entity->entities as $ent) {
          $entity_link = 'ting/object/' . $ent->id;

          // Create a list of links for each type.
          $types[] = array(
            'data' => l($ent->type, $entity_link),
            'class' => array('ting-item-type availability availability-' . $ent->localId, drupal_html_class($ent->type)),
          );
        }

        $element[$delta] = array(
          '#theme' => 'item_list',
          '#items' => $types,
          '#attached' => array(
            'js' => array(
              drupal_get_path('module', 'ding_availability') . '/js/ding_availability.availability.js',
            ),
            'css' => array(
              drupal_get_path('module', 'ding_availability') . '/css/ding_availability.css',
            ),
          ),
        );
        break;
    }
  }
  return $element;
}
