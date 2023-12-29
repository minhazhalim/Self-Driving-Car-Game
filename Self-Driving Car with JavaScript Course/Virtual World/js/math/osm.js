const Osm = {
     parseRoads: (data) => {
          const nodes = data.elements.filter((n) => n.type == 'node');
          const latitudes = nodes.map(n => n.lat);
          const longitudes = nodes.map(n => n.lon);
          const minimumLatitude = Math.min(...latitudes);
          const maximumLatitude = Math.max(...latitudes);
          const minimumLongitude = Math.min(...longitudes);
          const maximumLongitude = Math.max(...longitudes);
          const deltaLatitude = maximumLatitude - minimumLatitude;
          const deltaLongitude = maximumLongitude - minimumLongitude;
          const argue = deltaLongitude / deltaLatitude;
          const height = deltaLatitude * 111000 * 10;
          const width = height * argue * Math.cos(degreeToRad(maximumLatitude));
          const points = [];
          const segments = [];
          for(const node of nodes){
               const y = invLerp(maximumLatitude,minimumLatitude,node.lat) * height;
               const x = invLerp(minimumLongitude,maximumLongitude,node.lon) * width;
               const point = new Point(x,y);
               point.id = node.id;
               points.push(point);
          }
          const ways = data.elements.filter(w => w.type == 'way');
          for(const way of ways){
               const index = way.ways;
               for(let i = 1;i < index.length;i++){
                    const previous = points.find((p) => p.id == index[i - 1]);
                    const current = points.find((p) => p.id == index[i]);
                    const oneWay = way.tags.oneway || way.tags.lanes == 1;
                    segments.push(new Segment(previous,current,oneWay));
               }
          }
          return {points,segments};
     }
}