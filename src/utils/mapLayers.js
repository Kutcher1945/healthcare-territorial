import maplibregl from 'maplibre-gl';

export const clearFeatureStates = (map, polygonMapping) => {
  if (!map.getSource('policlinic-polygons')) return;

  Object.values(polygonMapping).flat().forEach((polygonId) => {
    try {
      map.removeFeatureState({
        source: 'policlinic-polygons',
        id: polygonId,
      });
    } catch (err) {
      // Silently ignore errors
    }
  });

  Object.keys(polygonMapping).forEach((pointId) => {
    try {
      map.removeFeatureState({
        source: 'policlinic-points',
        id: parseInt(pointId),
      });
    } catch (err) {
      // Silently ignore errors
    }
  });
};

export const setupPolygonLayers = (map, polygons) => {
  if (map.getSource('policlinic-polygons')) {
    map.getSource('policlinic-polygons').setData(polygons);
  } else {
    map.addSource('policlinic-polygons', {
      type: 'geojson',
      data: polygons,
    });

    map.addLayer({
      id: 'policlinic-polygons-fill',
      type: 'fill',
      source: 'policlinic-polygons',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#22c55e', // Green color for selected polygons (green-500)
          ['get', 'original_color'],
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.5, // Increased opacity for better visibility
          0.1,
        ],
      },
    }); 

    map.addLayer({
      id: 'policlinic-polygons-outline',
      type: 'line',
      source: 'policlinic-polygons',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#16a34a', // Darker green outline for selected (green-600)
          ['get', 'color'],
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3, // Thicker border when selected
          1.5,
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.8, // More visible when selected
          0.4,
        ],
      },
    });
  }
};

export const setupPointLayers = (map, points) => {
  if (map.getSource('policlinic-points')) {
    map.getSource('policlinic-points').setData(points);
  } else {
    map.addSource('policlinic-points', {
      type: 'geojson',
      data: points,
    });

    map.addLayer({
      id: 'policlinic-points-circle',
      type: 'circle',
      source: 'policlinic-points',
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          8,
          6,
        ],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });
  }
};

export const createPopup = (map, feature, lngLat) => {
  const photoUrl = feature.properties.photo;
  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: '240px',
  })
    .setLngLat(lngLat)
    .setHTML(`
      <div class="p-2 w-[220px]">
        <img
          src="${photoUrl}"
          alt="${feature.properties.name}"
          class="w-full h-28 object-cover rounded-md mb-2 shadow-sm"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27100%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27%3ENo Image%3C/text%3E%3C/svg%3E'"
        />
        <h5 class="font-semibold text-[12px] mb-1 text-gray-800">${feature.properties.name}</h5>
        <p class="text-[10px] text-gray-600 mb-2 text-left pl-5"> <b class="text-black">Адрес:</b> ${feature.properties.address}</p>
      </div>
    `)
    .addTo(map);

  return popup;
};

export const updateFeatureStates = (
  map,
  previousMarkerId,
  newMarkerId,
  polygonMapping
) => {
  // Reset previous marker if different
  if (previousMarkerId !== null && previousMarkerId !== newMarkerId) {
    try {
      map.setFeatureState(
        { source: 'policlinic-points', id: previousMarkerId },
        { selected: false }
      );

      const previousPolygonIds = polygonMapping[previousMarkerId] || [];
      previousPolygonIds.forEach((polygonId) => {
        try {
          map.setFeatureState(
            { source: 'policlinic-polygons', id: polygonId },
            { selected: false }
          );
        } catch (err) {
          // Silently ignore
        }
      });
    } catch (err) {
      console.warn('Error resetting previous marker:', err);
    }
  }

  // Set new marker as selected
  try {
    map.setFeatureState(
      { source: 'policlinic-points', id: newMarkerId },
      { selected: true }
    );

    const newPolygonIds = polygonMapping[newMarkerId] || [];
    newPolygonIds.forEach((polygonId) => {
      try {
        map.setFeatureState(
          { source: 'policlinic-polygons', id: polygonId },
          { selected: true }
        );
      } catch (err) {
        // Silently ignore
      }
    });
  } catch (err) {
    console.warn('Error setting new marker:', err);
  }
};
