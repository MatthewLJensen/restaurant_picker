import json
from unittest import result

# This cleans up OSM restuarant data. It clears anything without a name
# In order of obtain this data, use https://overpass-turbo.eu/s/1ikF in order to see the query. You will need to create your own bounding box
# If that link no longer works, use the following query within overpass-turbo.eu
# [out:json][timeout:25][bbox:{{bbox}}];
# (
#   node["amenity"="restaurant"]({{bbox}});
#   way["amenity"="restaurant"]({{bbox}});
#   relation["amenity"="restaurant"]({{bbox}});
# );
# out center;

# Load in the data

results = []

with open('data.json') as f:
    data = json.load(f)

    for i in data:
        if i['type'] == 'node' :
            if 'name' not in i['tags']:
                continue

        elif i['type'] == 'way':
            if 'name' not in i['tags']:
                continue
            
            # Change the center coordinates to match the same format as the nodes
            i['lat'] = i['center']['lat']
            i['lon'] = i['center']['lon']
            del i['center']

            # Delete the node data (this is just a bounding box for the restaraunt)
            del i['nodes']
            results.append(i)
        
        elif i['type'] == 'relation':
            # Not currently doing anything with relations since our query only returned 1 relation result
            continue
        
    # Save the data
    with open('exported_data.json', 'w') as f:
        json.dump(results, f)
        #print('Data exported')
        
