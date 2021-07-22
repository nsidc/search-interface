import GeoBoundingBox from '../../models/GeoBoundingBox';

  describe('GeoBoundingBox', function () {

    describe('construction methods', function () {
      it('can be created without parameters and it defaults to sensible values', function () {
        var bbox = new GeoBoundingBox();

        expect(bbox.getNorth()).toBe(90);
        expect(bbox.getSouth()).toBe(-90);
        expect(bbox.getEast()).toBe(180);
        expect(bbox.getWest()).toBe(-180);
      });

      it('can be created with an open search string "W,S,E,N"', function () {
        var bbox = new GeoBoundingBox('1,2,3,4');

        expect(bbox.getWest()).toBe(1);
        expect(bbox.getSouth()).toBe(2);
        expect(bbox.getEast()).toBe(3);
        expect(bbox.getNorth()).toBe(4);
      });

      it('can be created with an array of [lonMin, latMin, lonMax, latMax]', function () {
        var bbox = new GeoBoundingBox([1, 2, 3, 4]);

        expect(bbox.getWest()).toBe(1);
        expect(bbox.getSouth()).toBe(2);
        expect(bbox.getEast()).toBe(3);
        expect(bbox.getNorth()).toBe(4);
      });

      it('can be created with an object containing lonMin, latMin, lonMax, latMax', function () {
        var bbox = new GeoBoundingBox({lonMin: -30, latMin: -10, lonMax: 35, latMax: 15});

        expect(bbox.getWest()).toBe(-30);
        expect(bbox.getSouth()).toBe(-10);
        expect(bbox.getEast()).toBe(35);
        expect(bbox.getNorth()).toBe(15);
      });

      it('Should be created via urlPart string', function () {
        // arrange
        var urlPart = 'N:40,S:20,E:30,W:10',
        bbox = new GeoBoundingBox({urlPart: urlPart}),
        bbox2 = new GeoBoundingBox([10, 20, 30, 40]);
        // assert
        expect(bbox.isEqual(bbox2)).toBeTruthy();
      });

      it('Should set the default values when created', function () {
        var bbox = new GeoBoundingBox([1, 2, 3, 4]);

        expect(bbox.get('westDefault')).toBe(1);
        expect(bbox.get('southDefault')).toBe(2);
        expect(bbox.get('eastDefault')).toBe(3);
        expect(bbox.get('northDefault')).toBe(4);
      });

    });

    describe('default values', function () {
      it('Should know when it is currently set to the default values', function () {
        var bbox = new GeoBoundingBox();
        expect(bbox.isSetToDefaults()).toBe(true);
      });

      it('Should know when it is currently changed from the default values', function () {
        var bbox = new GeoBoundingBox();
        bbox.set('north', 0);
        expect(bbox.isSetToDefaults()).toBe(false);
      });

      it('Should return the default values', function () {
        var bbox = new GeoBoundingBox();
        bbox.set('north', 0);
        expect(bbox.getDefaults()).toEqual([-180, -90, 180, 90]);
      });

      it('Should reset to the default values on the search:resetBoundingBox event', function () {
        var bbox = new GeoBoundingBox();

        bbox.set('north', 0);
        bbox.onResetBoundingBox();

        expect(bbox.isSetToDefaults()).toBe(true);
      });

    });

    describe('setting the box from a NSEW object', function () {
      var geoBoundingBox, nsewObj, returnValue;

      beforeEach(function () {
        geoBoundingBox = new GeoBoundingBox([1, 2, 3, 4]);
        nsewObj = {
          south: 5,
          west: 6,
          north: 7,
          east: 8
        };
        returnValue = geoBoundingBox.setFromNsewObject(nsewObj);
      });

      it('Should reset coordinates from NSEW object', function () {
        expect(geoBoundingBox.getNorth()).toBe(nsewObj.north);
        expect(geoBoundingBox.getSouth()).toBe(nsewObj.south);
        expect(geoBoundingBox.getEast()).toBe(nsewObj.east);
        expect(geoBoundingBox.getWest()).toBe(nsewObj.west);
      });

      it('returns true if the NSEW object is a valid bounding box', function () {
        expect(returnValue).toBe(true);
      });

      describe('invalid NSEW object', function () {
        beforeEach(function () {
          geoBoundingBox = new GeoBoundingBox([1, 2, 3, 4]);
          nsewObj = {
            south: 99,
            north: 5,
            west: 8,
            east: 6
          };
          returnValue = geoBoundingBox.setFromNsewObject(nsewObj);
        });

        it('Should not reset coordinates from NSEW object if the NSEW object is not a valid bounding box', function () {
          expect(geoBoundingBox.getWest()).toBe(1);
          expect(geoBoundingBox.getSouth()).toBe(2);
          expect(geoBoundingBox.getEast()).toBe(3);
          expect(geoBoundingBox.getNorth()).toBe(4);
        });

        it('returns false if the NSEW object is not a valid bounding box', function () {
          expect(returnValue).toBe(false);
        });

      });

    });

    describe('modification methods', function () {

      it('Should reset coordinates with a properly formed string ', function () {
        var identifier, bbox;
        // arrange
        identifier = 'N:40.0, S:20.0, E:30.0, W:10.0';
        bbox = new GeoBoundingBox([1, 2, 3, 4]);
        // act
        bbox.setFromIdentifier(identifier);

        // assert
        expect(bbox.asIdentifier()).toBe(identifier);
      });

      it('Should reset the bounding box criteria to the default values', function () {
        var geoBoundingBox = new GeoBoundingBox([1, 2, 3, 4]);
        geoBoundingBox.set('north', 90);
        geoBoundingBox.set('south', 45);
        geoBoundingBox.set('east', 180);
        geoBoundingBox.set('west', -180);

        geoBoundingBox.resetCriteria();

        expect(geoBoundingBox.getWest()).toBe(1);
        expect(geoBoundingBox.getSouth()).toBe(2);
        expect(geoBoundingBox.getEast()).toBe(3);
        expect(geoBoundingBox.getNorth()).toBe(4);
      });

    });


    describe('comparison methods', function () {

      it('Should know if it is equal to another geoBoundingBox', function () {
        // arrange
        var corners = [1, 2, 3, 4],
        corners2 = [1, 2, 3, 4],
        bbox1 = new GeoBoundingBox(corners),
        bbox2 = new GeoBoundingBox(corners2);
        // assert
        expect(bbox1.isEqual(bbox2)).toBeTruthy();
      });

    });

    describe('valid bounding boxes', function () {

      beforeEach(function () {
        expect.extend({
          toBeValidBoundingBox: function () {
            return {
              compare: function(actual) {
                var notText = this.isNot ? ' not' : '',
                  boundingBox = actual;

                this.message = function () {
                  return 'Expected ' + boundingBox.toOpenSearchString() + notText + ' to be a valid bounding box';
                };

                return {pass: GeoBoundingBox.prototype.isValid(boundingBox)};
              }
            };
          }
        });
      });

      it('Should have a northern latitude greater than the southern latitude', function () {
        var box1 = new GeoBoundingBox([-180, -45, 180, 45]),
        box2 = new GeoBoundingBox([-180, 50, 180, 45]);

        expect(box1).toBeValidBoundingBox();
        expect(box2).not.toBeValidBoundingBox();
      });

      it('Should have coordinates within sensible boundaries', function () {
        var box1 = new GeoBoundingBox([-180, -90, 180, 90]),
        box2 = new GeoBoundingBox([-181, -90, 180, 90]),
        box3 = new GeoBoundingBox([-180, -91, 180, 90]),
        box4 = new GeoBoundingBox([-180, -90, 181, 90]),
        box5 = new GeoBoundingBox([-180, -90, 180, 91]);

        expect(box1).toBeValidBoundingBox();
        expect(box2).not.toBeValidBoundingBox();
        expect(box3).not.toBeValidBoundingBox();
        expect(box4).not.toBeValidBoundingBox();
        expect(box5).not.toBeValidBoundingBox();
      });

      it('Should allow boxes where the north and south coordinates are the same', function () {
        var box = new GeoBoundingBox([-180, 45, 180, 45]);

        expect(box).toBeValidBoundingBox();
      });

      it('Should return a bboxError when the box is invalid', function () {
        var box1 = new GeoBoundingBox([-181, -90, 180, 90]),
        box2 = new GeoBoundingBox([-180, -91, 180, 90]),
        box3 = new GeoBoundingBox([-180, -90, 181, 90]),
        box4 = new GeoBoundingBox([-180, -90, 180, 91]),
        box5 = new GeoBoundingBox([-180, 45, 180, 0]),
        box6 = new GeoBoundingBox(['west', 'south', 'east', 'north']);

        expect(box1.bboxErrors().westOutOfRange).toBe(true);
        expect(box2.bboxErrors().southOutOfRange).toBe(true);
        expect(box3.bboxErrors().eastOutOfRange).toBe(true);
        expect(box4.bboxErrors().northOutOfRange).toBe(true);
        expect(box5.bboxErrors().southGreaterThanNorth).toBe(true);
        expect(box6.bboxErrors().northInputNotNumber).toBe(true);
        expect(box6.bboxErrors().southInputNotNumber).toBe(true);
        expect(box6.bboxErrors().eastInputNotNumber).toBe(true);
      });

    });

    describe('Valid corner point box inputs', function () {
      beforeEach(function () {
        expect.extend({
          toBeValidCornerPointsBox: function () {
            return {
              compare: function(actual) {
                var notText = this.isNot ? ' not' : '',
                  cornerPointsBox = actual;

                this.message = function () {
                  return 'Expected ' + this.inputToString() + notText + ' to be a valid bounding box';
                };

                this.inputToString = function () {
                  return 'upper left lat: ' + cornerPointsBox.upperLeftLat + ', upper left lon: ' + cornerPointsBox.upperLeftLon +
                    ', lower right lat: ' + cornerPointsBox.lowerRightLat + ', lower right lon: ' + cornerPointsBox.lowerRightLon;
                };

                return {pass: GeoBoundingBox.prototype.isValidCornerPoints(cornerPointsBox)};
              }
            };
          }
        });
      });

      it('Should work with coordinates within valid ranges', function () {
        var corners = {upperLeftLat: 90, upperLeftLon: -180, lowerRightLat: -90, lowerRightLon: 180};

        expect(corners).toBeValidCornerPointsBox();
      });

      it('Should be invalid for coordinates with invalid ranges', function () {
        var corners1 = {upperLeftLat: 91, upperLeftLon: -180, lowerRightLat: -90, lowerRightLon: 180},
          corners2 = {upperLeftLat: 90, upperLeftLon: -181, lowerRightLat: -90, lowerRightLon: 180},
          corners3 = {upperLeftLat: 90, upperLeftLon: -180, lowerRightLat: -91, lowerRightLon: 180},
          corners4 = {upperLeftLat: 90, upperLeftLon: -180, lowerRightLat: -90, lowerRightLon: 181};

        expect(corners1).not.toBeValidCornerPointsBox();
        expect(corners2).not.toBeValidCornerPointsBox();
        expect(corners3).not.toBeValidCornerPointsBox();
        expect(corners4).not.toBeValidCornerPointsBox();
      });
    });


    describe('Formatting and accessing', function () {

      it('Should format properly for display in views', function () {
        // arrange
        var corners = [1, 2, 3, 4],
        expected = 'N:4.0, S:2.0, E:3.0, W:1.0',
        bbox = new GeoBoundingBox(corners);
        // assert
        expect(bbox.asIdentifier()).toEqual(expected);
      });

      it('Should render properly in URLs', function () {
        // arrange
        var corners = [1, 2, 3, 4],
        expectedUrl = 'N:4.0,S:2.0,E:3.0,W:1.0',
        bbox = new GeoBoundingBox(corners);
        // assert
        expect(bbox.asUrlId()).toEqual(expectedUrl);
      });


      it('Should provide a proper opensearch bounding box representation ', function () {
        // arrange
        var corners = [5, 6, 7, -8],
        bbox = new GeoBoundingBox(corners);
        // assert
        expect(bbox.toOpenSearchString()).toEqual('5,6,7,-8');
      });


      it('Should yield cardinals via interface', function () {
        // arrange
        var corners = [1.1, 2.1, 3.1, 4.1],
        bbox = new GeoBoundingBox(corners);
        // assert
        expect(bbox.getWest()).toBe(1.1);
        expect(bbox.getSouth()).toBe(2.1);
        expect(bbox.getEast()).toBe(3.1);
        expect(bbox.getNorth()).toBe(4.1);
      });

    });

  });
