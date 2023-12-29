class Start extends Marking {
     constructor(center,directionVector,width,height){
          super(center,directionVector,width,height);
          this.image = new Image();
          this.image.src = 'car.png';
          this.type = 'start';
     }
     draw(ctx){
          ctx.save();
          ctx.translate(this.center.x,this.center.y);
          ctx.rotate(angle(this.directionVector) - Math.PI / 2);
          ctx.drawImage(this.image,-this.image.width / 2,-this.image.height / 2);
          ctx.restore();
     }
}