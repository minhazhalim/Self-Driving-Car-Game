class Segment {
   constructor(p1,p2,oneWay = false){
      this.p1 = p1;
      this.p2 = p2;
      this.oneWay = oneWay;
   }
   length(){
      return distance(this.p1,this.p2);
   }
   directionVector(){
      return normalize(subtract(this.p2,this.p1));
   }
   equals(segment){
      return this.includes(segment.p1) && this.includes(segment.p2);
   }
   includes(point){
      return this.p1.equals(point) || this.p2.equals(point);
   }
   projectPoint(point) {
      const a = subtract(point,this.p1);
      const b = subtract(this.p2,this.p1);
      const normmalizeB = normalize(b);
      const scaler = dot(a,normmalizeB);
      const project = {
         point: add(this.p1,scale(normmalizeB,scaler)),
         offset: scaler / magnitude(b),
      };
      return project;
   }
   distanceToPoint(point){
      const project = this.projectPoint(point);
      if(project.offset > 0 && project.offset < 1){
         return distance(point,project.point);
      }
      const distanceToP1 = distance(point,this.p1);
      const distanceToP2 = distance(point,this.p2);
      return Math.min(distanceToP1,distanceToP2);
   }
   draw(ctx,{width = 2,color = "black",dash = [],cap = "butt"} = {}){
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineCap = cap;
      if(this.oneWay) dash = [4,4];
      ctx.setLineDash(dash);
      ctx.moveTo(this.p1.x,this.p1.y);
      ctx.lineTo(this.p2.x,this.p2.y);
      ctx.stroke();
      ctx.setLineDash([]);
   }
}