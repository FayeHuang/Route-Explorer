export const placeSymbol = color => ({
  path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9 A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9 A7,7 0 0,0 12,2Z',
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#000',
  strokeWeight: 1,
  scale: 1.5,
});
export const startSymbol = color => ({
  path: 'M14.5,6H20V16H13L12.5,14H7V21H5V4H14L14.5,6M7,6V12H13L13.5,14H18V8H14L13.5,6H7Z',
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#000',
  strokeWeight: 1,
  scale: 1.5,
});
export const endSymbol = color => ({
  path: 'M14.4,6H20V16H13L12.6,14H7V21H5V4H14L14.4,6M14,14H16V12H18V10H16V8H14V10L13,8V6H11V8H9V6H7V8H9V10H7V12H9V10H11V12H13V10L14,12V14M11,10V8H13V10H11M14,10H16V12H14V10Z',
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#000',
  strokeWeight: 1,
  scale: 1.5,
});
export const markerClusterSymbol = (fill) => {
  // SVG circle path
  // https://codepen.io/jakob-e/pen/bgBegJ/
  const path = 'M 100, 100 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0';
  const url = `data:image/svg+xml;base64,${window.btoa(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="36" height="36"><path fill="${fill}" d="${path}"/></svg>`)}`;
  return url;
};
export const initMarkerClusterer = (map, symbolColor) => {
  const newMarkerCluster = new window.MarkerClusterer(map, [],
    {
      styles: [{
        width: 36,
        height: 36,
        url: markerClusterSymbol(symbolColor),
      }],
      ignoreHiddenMarkers: true,
      averageCenter: true,
    },
  );
  return newMarkerCluster;
};
export const initInfoWindow = ({
  routeName,
  index,
  time,
  lat,
  lng,
}) => {
  const infowindow = new window.google.maps.InfoWindow({
    content: `<div>
                <div style="font-size:16px;padding:4px;">[${routeName}] ${index + 1}</div>
                <div style="padding:4px;">${time.format('YYYY-MM-DD HH:mm:ss')}</div>
                <div style="padding:4px;">${lat}, ${lng}</div>
              </div>`,
  });
  return infowindow;
};
export const hideRoute = ({
  markerCluster,
  firstMarker,
  lastMarker,
}) => {
  markerCluster.clearMarkers();
  firstMarker.setMap(null);
  lastMarker.setMap(null);
};
export const showRoute = (map, {
  routeColor,
  markerCluster,
  markers,
  firstMarker,
  lastMarker,
}) => {
  // markerCluster.clearMarkers();
  // markers.forEach(m => m.setMap(null));
  markerCluster.addMarkers(markers.slice(1, markers.length - 1));
  firstMarker.setMap(map);
  firstMarker.setIcon(startSymbol(routeColor));
  lastMarker.setMap(map);
  lastMarker.setIcon(endSymbol(routeColor));
};
export const initMarker = (map, {
  routeName,
  routeColor,
  index,
  time,
  lat,
  lng,
  isFirstRecord,
  isLastRecord,
}) => {
  let symbol = null;
  if (isFirstRecord) {
    symbol = startSymbol(routeColor);
  } else if (isLastRecord) {
    symbol = endSymbol(routeColor);
  } else {
    symbol = placeSymbol(routeColor);
  }
  const marker = new window.google.maps.Marker({
    position: { lat, lng },
    icon: symbol,
  });
  // init marker info window
  const infowindow = initInfoWindow({ routeName, index, time, lat, lng });
  marker.addListener('mouseover', () => {
    infowindow.open(map, marker);
  });
  marker.addListener('mouseout', () => {
    infowindow.close(map, marker);
  });
  return marker;
};
export const setMapCenterZoom = (map, markers) => {
  // https://coderwall.com/p/hojgtq/auto-center-and-auto-zoom-a-google-map
  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach((marker) => {
    bounds.extend(marker.getPosition());
  });
  map.panToBounds(bounds);
  map.fitBounds(bounds);
};
export const setMarkerColor = ({
  marker,
  color,
  isFirstRecord,
  isLastRecord,
}) => {
  if (isFirstRecord) {
    marker.setIcon(startSymbol(color));
  } else if (isLastRecord) {
    marker.setIcon(endSymbol(color));
  } else {
    marker.setIcon(placeSymbol(color));
  }
};
export const setMarkerClusterColor = ({
  markerCluster,
  color,
}) => {
  markerCluster.setStyles(
    [{
      width: 36,
      height: 36,
      url: markerClusterSymbol(color),
    }],
  );
};
