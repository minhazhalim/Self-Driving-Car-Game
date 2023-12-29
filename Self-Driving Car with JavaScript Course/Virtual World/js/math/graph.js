class Graph {
     constructor(points = [],segments = []){
          this.points = points;
          this.segments = segments;
     }
     static load(info){
          const points = info.points.map((index) => new Point(index.x,index.y));
          const segments = info.segments.map((index) => new Segment(
               points.find((p) => p.equals(index.p1)),
               points.find((p) => p.equals(index.p2)),
          ));
          return new Graph(points,segments);
     }
     hash(){
          return JSON.stringify(this);
     }
     addPoint(point){
          this.points.push(point);
     }
     containsPoint(point){
          return this.points.find((p) => p.equals(point));
     }
     tryAddPoint(point){
          if(!this.containsPoint(point)){
               this.addPoint(point);
               return true;
          }
          return false;
     }
     removePoint(point){
          const segments = this.getSegmentsWithPoint(point);
          for(const segment of segments){
               this.removeSegment(segment);
          }
          this.points.splice(this.points.indexOf(point),1);
     }
     addSegment(segment){
          this.segments.push(segment);
     }
     containsSegment(segment){
          return this.segments.find((s) => s.equals(segment));
     }
     tryAddSegment(segment){
          if(!this.containsSegment(segment) && !segment.p1.equals(segment.p2)){
               this.addSegment(segment);
               return true;
          }
          return false;
     }
     removeSegment(segment){
          this.segments.splice(this.segments.indexOf(segment),1);
     }
     getSegmentsWithPoint(point){
          const segments = [];
          for(const segment of this.segments){
               if(segment.includes(point)) segments.push(segment);
          }
          return segments;
     }
     dispose(){
          this.points.length = 0;
          this.segments.length = 0;
     }
     draw(ctx){
          for(const segment of this.segments){
               segment.draw(ctx);
          }
          for(const point of this.points){
               point.draw(ctx);
          }
     }
}