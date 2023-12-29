function distance(p1,p2){
     return Math.hypot(p1.x - p2.x,p1.y - p2.y);
}
function average(p1,p2){
     return new Point((p1.x + p2.x) / 2,(p1.y + p2.y) / 2);
}
function dot(p1,p2){
     return p1.x * p2.x + p1.y * p2.y;
}
function add(p1,p2){
     return new Point(p1.x + p2.x,p1.y + p2.y);
}
function subtract(p1,p2){
     return new Point(p1.x - p2.x,p1.y - p2.y);
}
function perpendicular(point){
     return new Point(-point.y,point.x);
}
function angle(point){
     return Math.atan2(point.y,point.x);
}
function scale(point,scaler){
     return new Point(point.x * scaler,point.y * scaler);
}
function magnitude(point){
     return Math.hypot(point.x,point.y);
}
function normalize(point){
     return scale(point,1 / magnitude(point));
}
function translate(location,angle,offset){
     return new Point(location.x + Math.cos(angle) * offset,location.y + Math.sin(angle) * offset);
}
function lerp(a,b,t){
     return a + (b - a) * t;
}
function lerp2D(A,B,t){
     return new Point(lerp(A.x,B.x,t),lerp(A.y,B.y,t));
}
function invLerp(a,b,v){
     return (v - a) / (b - a);
}
function degreeToRad(degree){
     return degree * Math.PI / 180;
}
function getRandomColor(){
     const hue = 290 + Math.random() * 260;
     return 'hsl(' + hue + ',100%,60%)';
}
function getNearestPoint(location,points,threshold = Number.MAX_SAFE_INTEGER){
     let minimumDistance = Number.MAX_SAFE_INTEGER;
     let nearest = null;
     for(const point of points){
          const dist = distance(point,location);
          if(dist < minimumDistance && dist < threshold){
               minimumDistance = dist;
               nearest = point;
          }
     }
     return nearest;
}
function getNearestSegment(location,segments,threshold = Number.MAX_SAFE_INTEGER){
     let minimumDistance = Number.MAX_SAFE_INTEGER;
     let nearest = null;
     for(const segment of segments){
          const dist = segment.distanceToPoint(location);
          if(dist < minimumDistance && dist < threshold){
               minimumDistance = dist;
               nearest = segment;
          }
     }
     return nearest;
}
function getFake3dPoint(point,viewPoint,height){
     const direction = normalize(subtract(point,viewPoint));
     const dist = distance(point,viewPoint);
     const scaler = Math.atan(dist / 300) / (Math.PI / 2);
     return add(point,scale(direction,height * scaler));
}
function getIntersection(A,B,C,D){
     const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
     const uTop = (C.y - A.x) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
     const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
     const eps = 0.001;
     if(Math.abs(bottom) > eps){
          const top = tTop / bottom;
          const up = uTop / bottom;
          if(top >= 0 && top <= 1 && up >= 0 && up <= 1){
               return {x: lerp(A.x,B.x,top),y: lerp(A.y,B.y,top),offset: top};
          }
     }
     return null;
}