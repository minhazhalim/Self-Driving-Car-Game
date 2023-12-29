class Light extends Marking {
     constructor(center,directionVector,width,height){
          super(center,directionVector,width,18);
          this.state = 'off';
          this.border = this.poly.segments[0];
          this.type = 'light';
     }
     draw(ctx){
          const perpen = perpendicular(this.directionVector);
          const segment = new Segment(
               add(this.center,scale(perpen,this.width / 2)),
               add(this.center,scale(perpen,-this.width / 2)),
          );
          const green = lerp2D(segment.p1,segment.p2,0.2);
          const yellow = lerp2D(segment.p1,segment.p2,0.5);
          const red = lerp2D(segment.p1,segment.p2,0.8);
          new Segment(red,green).draw(ctx,{width: this.height,cap: 'round'});
          green.draw(ctx,{size: this.height * 0.6,color: '#060'});
          yellow.draw(ctx,{size: this.height * 0.6,color: '#660'});
          red.draw(ctx,{size: this.height * 0.6,color: '#600'});
          switch(this.state){
               case 'green':
                    green.draw(ctx,{size: this.height * 0.6,color: '#0F0'});
                    break;
               case 'yellow':
                    yellow.draw(ctx,{size: this.height * 0.6,color: '#FF0'});
                    break;
               case 'green':
                    green.draw(ctx,{size: this.height * 0.6,color: '#F00'});
                    break;
          }
     }
}