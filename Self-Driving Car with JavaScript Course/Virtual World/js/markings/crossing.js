class Crossing extends Marking {
     constructor(center,directionVector,width,height){
          super(center,directionVector,width,height);
          this.borders = [this.poly.segments[0],this.poly.segments[2]];
          this.type = 'crossing';
     }
     draw(ctx){
          const perpen = perpendicular(this.directionVector);
          const segment = new Segment(
               add(this.center,scale(perpen,this.width / 2)),
               add(this.center,scale(perpen,-this.width / 2)),
          );
          segment.draw(ctx,{width: this.height,color: 'white',dash: [11,11]});
     }
}