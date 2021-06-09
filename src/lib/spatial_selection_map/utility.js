export function openLayerRectangleFactory(
  upperLeftPoint,
  upperRightPoint,
  lowerRightPoint,
  lowerLeftPoint
) {
  var linearRingPoints = [],
    polygon;

  linearRingPoints.push(upperLeftPoint);
  linearRingPoints.push(upperRightPoint);
  linearRingPoints.push(lowerRightPoint);
  linearRingPoints.push(lowerLeftPoint);

  // Construct the new Geometry polygon object with the array of points
  // we just created.
  // polygon = new OpenLayers.Geometry.Polygon(
  //   [new OpenLayers.Geometry.LinearRing(linearRingPoints)]
  // );

  return polygon;
}
