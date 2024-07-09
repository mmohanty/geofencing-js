$('document').ready(() => {

    // Object to keep track of selected states
    const selectedStates = new Map();
    const selectedFeatures = new Map();
    var map;
    const renderMap = () => {
        
        if(map){
            map.off();
            map.remove();
        }
        map = L.map('mapid').setView([37.8, -96], 4); // Center of the US

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 10,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        $.getJSON("data/us-states.json", function (geoJsonData) {
            //$("#selected-account").val("account1");
            if ($.isEmptyObject(selectedStates)) {
                $('#submit').prop('disabled', true);
            }
            L.geoJson(geoJsonData, {
                style: function (feature) {
                    return { color: 'blue', weight: 2 };
                },
                onEachFeature: function (feature, layer) {
                    // Add state names on the map
                    const bounds = layer.getBounds();
                    const center = bounds.getCenter();
                    L.marker(center, {
                        icon: L.divIcon({
                            className: 'state-label',
                            html: feature.properties.name,
                            iconSize: [100, 40]
                        })
                    }).addTo(map);
                    const currentStateName = feature.properties.name;
                    if(selectedStates && selectedStates.get(currentStateName)){
                        layer.setStyle({ color: 'red' });
                        $('#submit').prop('disabled', false);
                    }
                    // Click handler for each state
                    layer.on('click', function () {
                        const stateName = feature.properties.name;
                        const featureId = feature.id;
                        // Toggle selection
                        if (selectedStates.get(stateName)) {
                            selectedStates.delete(stateName);
                            selectedFeatures.delete(featureId);
                            layer.setStyle({ color: 'blue' });
                        } else {
                            selectedStates.set(stateName, true);
                            selectedFeatures.set(featureId, stateName);
                            layer.setStyle({ color: 'red' });
                        }
                        console.log(feature);
                        updateSidebar();
                        if ($.isEmptyObject(selectedStates)) {
                            $('#submit').prop('disabled', true);
                        } else {
                            $('#submit').prop('disabled', false);
                        }
                    });
                }
            }).addTo(map);
        });
    }

    // Load GeoJSON from an external file

        $.ajax({
            type: 'GET',
            url: 'https://mocki.io/v1/58d26a31-df69-4909-9d23-b5a29bdd9e3c',
            success: function (data) {
                console.log(data);
                // Populate account dropdown
                const accountList = data.map(account => `<option value="${account.accountId}">${account.accountName}</option>`);
                $('#selected-account').append(accountList);
            }
        });
        renderMap();



    function updateSidebar() {
        const sidebar = document.getElementById('selected-states');
        sidebar.innerHTML = '';
        selectedStates.forEach((values, keys) => {
            sidebar.innerHTML += `<div class="state-name">${keys}</div>`;
        });
        
    }
    $('#submit-states').on('click', function (e) {
        const account = $('#selected-account').val();
        const mapData = new Map();
        for (const [key, value] of Object.entries(selectedFeatures)) {
            //console.log(key, value);
            mapData.set(key, value);
        }

        const obj = Object.fromEntries(mapData);
        const stateMapJson = JSON.stringify(obj);
        var json = '{' + '\"account_number\":' + "\"" +account  + "\"" + ',' + '\"state_map\":' +  stateMapJson + '}';

        $.ajax({
            type: 'POST',
            url: 'http://localhost:8090/states',
            headers: { 
                'Content-Type': 'application/json;charset=UTF-8' 
            },
            dataType: "json",
            beforeSend: function(x) {
                if (x && x.overrideMimeType) {
                x.overrideMimeType("application/json;charset=UTF-8");
                }
            },
            crossDomain: true, 
            data: json,
            success: function (data) {
                $.toast({
                    heading: 'Success',
                    text: 'Successfully saved states',
                    showHideTransition: 'slide',
                    icon: 'success'
                })
            }
        });
    });

    $('#selected-account').on('change', function (e) {
        const account = $(this).val(e.target.value);
        var item=$(this);
        var accountNumber = item.val();
        selectedStates.clear();
        selectedFeatures.clear();
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8090/states/' + accountNumber,
            success: function (data) {
                console.log(data);
                // Populate selected states
                // Create an array of selected states
                var s = data['states'];
                for (var i = 0; i < s.length; i++) {
                    selectedStates.set(s[i].state_name, true);
                    selectedFeatures.set(s[i].id, s[i].state_name);
                }

                updateSidebar();
                renderMap();
            }
        });

        
    });

});