import Backbone from 'backbone';
import _ from 'underscore';
import * as UtilityFunctions from '../lib/utility_functions';

// GeoBoundingBox can be constructed with the following argument forms:
// * array - a 4-element array of numbers in the opengeo format, i.e. [west, south, east, north]
// * object - an object with lat and lon Min and Max, e.g. {lonMin: __, lonMax: __, latMin: __, latMax:__}
// * urlPart object - an object that has a urlPart property, formatted like 'N:90,S:45,E:180,W:-180'
class GeoBoundingBox extends Backbone.Model {

    initialize(options) {
        const cornerLocs = options.cornerLocs;
        if(cornerLocs === undefined) {
            this.set({
                north: 90,
                south: -90,
                east: 180,
                west: -180
            });
        }
        else if(cornerLocs instanceof Array) {
            this.set('west', cornerLocs[0]);
            this.set('south', cornerLocs[1]);
            this.set('east', cornerLocs[2]);
            this.set('north', cornerLocs[3]);
        }
        else if(cornerLocs instanceof Object &&
            cornerLocs.hasOwnProperty('lonMin') &&
            cornerLocs.hasOwnProperty('lonMax') &&
            cornerLocs.hasOwnProperty('latMin') &&
            cornerLocs.hasOwnProperty('latMax')) {
            this.set('west', cornerLocs.lonMin);
            this.set('south', cornerLocs.latMin);
            this.set('east', cornerLocs.lonMax);
            this.set('north', cornerLocs.latMax);
        }
        else if(cornerLocs.hasOwnProperty('urlPart')) {
            this.setFromIdentifier(cornerLocs.urlPart);
        }
        else if(typeof cornerLocs === 'string') {
            this.setFromOpenSearchString(cornerLocs);
        }

        this.setDefaults();
        options.mediator.on('search:resetBoundingBox', this.onResetBoundingBox, this);
    }

    setDefaults() {
        this.set({
            northDefault: this.get('north'),
            southDefault: this.get('south'),
            eastDefault: this.get('east'),
            westDefault: this.get('west')
        });
    }

    getDefaults() {
        return [this.get('westDefault'), this.get('southDefault'), this.get('eastDefault'), this.get('northDefault')];
    }

    isSetToDefaults() {
        var n = this.get('north') === this.get('northDefault'),
            s = this.get('south') === this.get('southDefault'),
            e = this.get('east') === this.get('eastDefault'),
            w = this.get('west') === this.get('westDefault');

        return n && s && e && w;
    }

    resetCriteria() {
        this.set({
            north: this.get('northDefault'),
            south: this.get('southDefault'),
            east: this.get('eastDefault'),
            west: this.get('westDefault')
        });
    }

    getBox() {
        return this.getBboxArrayFromCoords();
    }

    getWest() {
        return this.get('west');
    }

    getSouth() {
        return this.get('south');
    }

    getEast() {
        return this.get('east');
    }

    getNorth() {
        return this.get('north');
    }

    setFromOpenSearchString(string) {
        var bboxArray, cardinals = ['west', 'south', 'east', 'north'];

        bboxArray = string.split(',');
        _.each(bboxArray, function (coordinate, i) {
            this.set(cardinals[i], parseFloat(coordinate));
        }, this);
    }

    setFromIdentifier(identifier) {
        var coords;

        identifier = identifier.split(' ').join('');

        if(identifier === '') {
            this.resetCriteria();
        }
        else {
            coords = this.getCoordsFromUrlPart(identifier);
            this.set('north', coords.north);
            this.set('south', coords.south);
            this.set('east', coords.east);
            this.set('west', coords.west);
        }

        return this;
    }

    setFromNsewObject(nsewObj, options) {

        if(!this.isValid({
            north: nsewObj.north,
            south: nsewObj.south,
            east: nsewObj.east,
            west: nsewObj.west
        })) {
            return false;
        }

        this.set({
            'north': parseFloat(nsewObj.north),
            'south': parseFloat(nsewObj.south),
            'east': parseFloat(nsewObj.east),
            'west': parseFloat(nsewObj.west)
        }, options);

        return true;
    }

    getBboxArrayFromCoords() {
        return [this.get('west'), this.get('south'), this.get('east'), this.get('north')];
    }

    bboxDisplayOrder() {
        // return the values in 'display order' N, S, E, W
        // TODO [MHS, 2012-10-11]  push this functionality in to the view.
        var coordinates = [
            parseFloat(this.getNorth()),
            parseFloat(this.getSouth()),
            parseFloat(this.getEast()),
            parseFloat(this.getWest())
        ];

        _.each(coordinates, function (element, index, list) {
            list[index] = element.toString().indexOf('.') > -1 ? element.toString() : element.toFixed(1);
        });

        return coordinates;
    }

    isEqual(compareBox) {
        return _.isEqual(this.getBboxArrayFromCoords(), compareBox.getBox());
    }

    asIdentifier() {
        var cardinals = ['N', 'S', 'E', 'W'];
        return _.map(_.zip(cardinals, this.bboxDisplayOrder()),
            function (each) {
                return each.join(':');
            }
        ).join(', ');
    }

    asUrlId() {
        // remove spaces for url
        return this.asIdentifier().split(' ').join('');
    }

    toOpenSearchString() {
        return this.getBboxArrayFromCoords().join(',');
    }

    onResetBoundingBox() {
        this.resetCriteria();
    }

    isValid(boundingBox) {
        var isValid = true,
            errors = GeoBoundingBox.prototype.bboxErrors(boundingBox);

        _.each(errors, function (error) {
            if(error) {
                isValid = false;
            }
        });

        return isValid;
    }

    bboxErrors(boundingBox) {
        var north, south, east, west,
            northFloat, southFloat, eastFloat, westFloat,
            isFloat = UtilityFunctions.isFloat, coords;

        if(boundingBox === undefined) {
            boundingBox = this;
        }

        coords = this.getBboxCoords(boundingBox);
        north = coords.north;
        south = coords.south;
        east = coords.east;
        west = coords.west;

        northFloat = parseFloat(north);
        southFloat = parseFloat(south);
        eastFloat = parseFloat(east);
        westFloat = parseFloat(west);

        GeoBoundingBox.errors = {
            northInputNotNumber: !isFloat(north),
            southInputNotNumber: !isFloat(south),
            eastInputNotNumber: !isFloat(east),
            westInputNotNumber: !isFloat(west),
            northOutOfRange: northFloat < -90 || 90 < northFloat,
            southOutOfRange: southFloat < -90 || 90 < southFloat,
            eastOutOfRange: eastFloat < -180 || 180 < eastFloat,
            westOutOfRange: westFloat < -180 || 180 < westFloat,
            southGreaterThanNorth: southFloat > northFloat
        };

        return GeoBoundingBox.errors;
    }

    isValidCornerPoints(cornerPoints) {
        var isValid = true,
            errors = GeoBoundingBox.prototype.cornerErrors(cornerPoints);

        _.each(errors, function (error) {
            if(error) {
                isValid = false;
            }
        });
        return isValid;
    }

    cornerErrors(cornerPoints) {
        var upperLeftLatFloat, upperLeftLonFloat, lowerRightLatFloat, lowerRightLonFloat,
            isFloat = UtilityFunctions.isFloat;

        if(cornerPoints === undefined) {
            cornerPoints = this;
        }

        // evaluate an actual object or a simple object only having properties
        upperLeftLatFloat = parseFloat(cornerPoints.upperLeftLat);
        upperLeftLonFloat = parseFloat(cornerPoints.upperLeftLon);
        lowerRightLatFloat = parseFloat(cornerPoints.lowerRightLat);
        lowerRightLonFloat = parseFloat(cornerPoints.lowerRightLon);

        GeoBoundingBox.cornerErrors = {
            upperLeftLatInputNotNumber: !isFloat(cornerPoints.upperLeftLat),
            upperLeftLonInputNotNumber: !isFloat(cornerPoints.upperLeftLon),
            lowerRightLatInputNotNumber: !isFloat(cornerPoints.lowerRightLat),
            lowerRightLonInputNotNumber: !isFloat(cornerPoints.lowerRightLon),
            upperLeftLatOutOfRange: upperLeftLatFloat < -90 || 90 < upperLeftLatFloat,
            upperLeftLonOutOfRange: upperLeftLonFloat < -180 || 180 < upperLeftLonFloat,
            lowerRightLatOutOfRange: lowerRightLatFloat < -90 || 90 < lowerRightLatFloat,
            lowerRightLonOutOfRange: lowerRightLonFloat < -180 || 180 < lowerRightLonFloat
        };

        return GeoBoundingBox.cornerErrors;
    }

    numberPart(numWithCardinal) {
        return UtilityFunctions.toNumber(
            numWithCardinal.substring(2, numWithCardinal.length),
            'float', 'Invalid number with Cardinal'
        );
    }

    getCoordsFromUrlPart(urlPart) {
        // parsing the URL piece =>  'N:1,S:2,E:3,W:4'
        var coords = {}, box = {},
            cardinals = ['north', 'south', 'east', 'west'];
        box = urlPart.split(',');
        _.each(box, function (coordinate, index) {
            coords[cardinals[index]] = this.numberPart(coordinate);
        });
        return coords;
    }

    // evaluate an actual GeoBoundingBox object or a simple object only having
    // properties north, south, east, and west
    getBboxCoords(bbox) {
        return {
            north: bbox.north || bbox.getNorth(),
            south: bbox.south || bbox.getSouth(),
            east: bbox.east || bbox.getEast(),
            west: bbox.west || bbox.getWest()
        };
    }

}
  // }, {
  //   errors: {
  //     northInputNotNumber : false,
  //     southInputNotNumber : false,
  //     eastInputNotNumber : false,
  //     westInputNotNumber : false,
  //     northOutOfRange : false,
  //     southOutOfRange : false,
  //     eastOutOfRange : false,
  //     westOutOfRange : false,
  //     southGreaterThanNorth : false,
  //     upperLeftLatInputNotNumber : false,
  //     upperLeftLonInputNotNumber : false,
  //     lowerRightLatInputNotNumber : false,
  //     lowerRightLonInputNotNumber : false,
  //     upperLeftLatOutOfRange : false,
  //     upperLeftLonOutOfRange : false,
  //     lowerRightLatOutOfRange : false,
  //     lowerRightLonOutOfRange : false
  //   }

export default GeoBoundingBox;
