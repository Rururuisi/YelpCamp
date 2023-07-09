(() => {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: campground.geometry.coordinates, // starting position [lng, lat]
        zoom: 10, // starting zoom
    });

    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker()
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 30 })
                .setHTML(
                    `<h6>${campground.title}</h6><div><small>${campground.location}</small></div>`
                )
        )
        .addTo(map);

    map.addControl(new mapboxgl.NavigationControl());

    const layerList = document.getElementById('menu');
    const inputs = layerList.getElementsByTagName('input');

    for (const input of inputs) {
        input.onclick = (layer) => {
            const layerId = layer.target.id;
            map.setStyle('mapbox://styles/mapbox/' + layerId);
        };
    }
})()