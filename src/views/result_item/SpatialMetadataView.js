import * as Backbone from 'backbone';
import _ from 'underscore';
import * as UtilityFunctions from '../../lib/utility_functions';
import sprintf from 'voca/sprintf';
import SpatialThumbnailView from './SpatialThumbnailView';
import viewTemplate from '../../templates/result_item/spatial_metadata.html';
import noDataViewTemplate from '../../templates/result_item/spatial_metadata_without_data.html';

  // formatDecimalPair = function (min, max) {
  //   return min.toFixed(2) + ', ' + max.toFixed(2);
  // };
  //
  // validBoundingBox = function (bbox) {
  //   var array = bbox ? bbox.split(' ') : [], north, south, east, west;
  //
  //   north = parseFloat(array[2], 10);
  //   south = parseFloat(array[0], 10);
  //   east = parseFloat(array[3], 10);
  //   west = parseFloat(array[1], 10);
  //
  //   if (array && !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
  //     return {latMin: south, latMax: north, lonMin: west, lonMax: east};
  //   } else {
  //     return false;
  //   }
  //
  // };

  // format the bounding boxes in a table for the on-hover popup
  //
  // returns a string that will be displayed as a table when displayed with
  // fixed-width font
  //
  // Examples:
  // s - sign
  // h - hundreds place
  // t - tens place
  // o - ones place
  // . - decimal point
  // d - tenths place (deci)
  // c - hundredths place (centi)
  //
  // ' North   South   East     West  '
  // 'sto.dc  sto.dc  shto.dc  shto.dc'
  // ' 90     -90      180     -180   '
  // ' 38      28      -80      -90   '
  // ' -7     -17      -40      -50   '
  // ' 31.91   30.79   -82.69   -83.98'
  // '  0       0        0        0   '
  function bboxFormat(boundingBoxes) {
    const labelRow = sprintf(' %-6s  %-6s  %-7s  %-7s', 'North', 'South', 'East', 'West');

    return _.reduce(boundingBoxes, function (memo, bbox) {
      const northStr = getCoordStr(bbox.north, 3),
          southStr = getCoordStr(bbox.south, 3),
          eastStr  = getCoordStr(bbox.east,  4),
          westStr  = getCoordStr(bbox.west,  4);

      return memo + '\n' + sprintf('%-6s  %-6s  %-7s  %-7s', northStr, southStr, eastStr, westStr);

    }, labelRow);

  }

  // coord - the value of one edge of the bounding box
  //
  // integerPartWidth - number of chars to allot for the integer part of the
  //   number, including sign; North and South's integer parts can be up to 2
  //   digits long (up to 90, 3 digits with negative sign), while East and West
  //   go up to 180, so East and West need one more character
  function getCoordStr(coord, integerPartWidth) {
    var // coord string needs 3 chars for decimal point and 2 decimal digits
        strWidth = integerPartWidth + 3,

        // if coord is nonnegative, we still want a space preceding the integer
        // part for alignment purposes
        coordSign = coord < 0 ? '-' : ' ',

        // break up the coord number into string parts we can format
        coordSplit = coord.toString().replace('-', '').split('.'),

        // right-align the integer part of the number, with sign
        // i.e., '  -9' for east/west, or ' 85' for north/south
        coordInteger = sprintf('%' + integerPartWidth + 's', coordSign + coordSplit[0]),

        // capture decimal part of the number; if coord is a whole number, do
        // not include the decimal point
        coordDec = coordSplit[1] === undefined ? '   ' : '.' + coordSplit[1],

        // the final formatted string, where any given coord will have a
        // consistent location for the ones and tens place so that they will
        // line up nicely when displaying multiple rows
        coordStr = sprintf('%-' + strWidth + 's', coordInteger + coordDec);

    return coordStr;
  }

class SpatialMetadataView extends Backbone.View {

    initialize(options) {
        this.options = options;
    }

    render() {
      let boundingBoxes = this.model.get('boundingBoxes'),
          bboxTable;

      if (boundingBoxes && boundingBoxes.length > 0) {
        // Only want to list at most 6 bounding boxes
        boundingBoxes = boundingBoxes.slice(0, 6);
        _.each(boundingBoxes, function (box) {
          _.each(box, function (coordinate, property) {
            box[property] = UtilityFunctions.round(coordinate, 2);
          });
        });
        this.$el.html(_.template(viewTemplate)());

        bboxTable = bboxFormat(boundingBoxes);
        this.$el.attr('data-bbox', bboxTable);
        this.$el.attr('alt', bboxTable);

        this.$el.closest('.spatial-coverage').addClass('with-map-data');
      } else {
        this.$el.html(_.template(noDataViewTemplate)());
      }

      if (this.options.config.mapThumbnail) {
        new SpatialThumbnailView({
          el: this.$el.find('.leaflet-map'),
          model: this.model,
          mapThumbnailBounds: this.options.config.mapThumbnailBounds,
          mapThumbnailShading: this.options.config.mapThumbnailShading,
          mapProjection: this.options.config.mapProjection,
          mapPixelSize: this.options.config.mapPixelSize
        }).render();
      }

      return this;
    }

  }

export default SpatialMetadataView;

