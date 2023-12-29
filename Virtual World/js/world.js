class World {
   constructor(graph,roadWidth = 100,roadRoundness = 10,buildingWidth = 150,buildingMinimumLength = 150,spacing = 50,treeSize = 1){
      this.graph = graph;
      this.roadWidth = roadWidth;
      this.roadRoundness = roadRoundness;
      this.buildingWidth = buildingWidth;
      this.buildingMinimumLength = buildingMinimumLength;
      this.spacing = spacing;
      this.treeSize = treeSize;
      this.envelopes = [];
      this.roadBorders = [];
      this.buildings = [];
      this.trees = [];
      this.laneGuides = [];
      this.markings = [];
      this.cars = [];
      this.bestCar = null;
      this.frameCount = 0;
      this.generate();
   }
   static load(info){
      const world = new World(new Graph());
      world.graph = Graph.load(info.graph);
      world.roadWidth = info.roadWidth;
      world.roadRoundness = info.roadRoundness;
      world.buildingWidth = info.buildingWidth;
      world.buildingMinimumLength = info.buildingMinimumLength;
      world.spacing = info.spacing;
      world.treeSize = info.treeSize;
      world.envelopes = info.envelopes.map((event) => Envelope.load(event));
      world.roadBorders = info.roadBorders.map((b) => new Segment(b.p1,b.p2));
      world.buildings = info.buildings.map((event) => Building.load(event));
      world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
      world.laneGuides = info.laneGuides.map((g) => new Segment(g.p1,g.p2));
      world.markings = info.markings.map((m) => Marking.load(m));
      world.zoom = info.zoom;
      world.offset = info.offset;
      return world;
   }
   #generateLaneGuides(){
      const temporaryEnvelopes = [];
      for(const segment of this.graph.segments){
         temporaryEnvelopes.push(new Envelope(segment,this.roadWidth / 2,this.roadRoundness));
      }
      const segments = Polygon.union(temporaryEnvelopes.map((event) => event.poly));
      return segments;
   }
   #generateBuildings() {
      const temporaryEnvelopes = [];
      for(const segment of this.graph.segments){
         temporaryEnvelopes.push(new Envelope(segment,this.roadWidth + this.buildingWidth + this.spacing * 2,this.roadRoundness));
      }
      const guides = Polygon.union(temporaryEnvelopes.map((event) => event.poly));
      for(let i = 0;i < guides.length;i++){
         const segment = guides[i];
         if(segment.length() < this.buildingMinimumLength){
            guides.splice(i,1);
            i--;
         }
      }
      const supports = [];
      for(let segment of guides){
         const length = segment.length() + this.spacing;
         const buildingCount = Math.floor(length / (this.buildingMinimumLength + this.spacing));
         const buildingLength = length / buildingCount - this.spacing;
         const direction = segment.directionVector();
         let q1 = segment.p1;
         let q2 = add(q1,scale(direction,buildingLength));
         supports.push(new Segment(q1,q2));
         for(let i = 2;i <= buildingCount;i++){
            q1 = add(q2,scale(direction,this.spacing));
            q2 = add(q1,scale(direction,buildingLength));
            supports.push(new Segment(q1,q2));
         }
      }
      const bases = [];
      for(const segment of supports){
         bases.push(new Envelope(segment,this.buildingWidth).poly);
      }
      const eps = 0.001;
      for(let i = 0;i < bases.length - 1;i++){
         for(let j = i + 1;j < bases.length;j++){
            if (bases[i].intersectsPoly(bases[j]) || bases[i].distanceToPoly(bases[j]) < this.spacing - eps){
               bases.splice(j,1);
               j--;
            }
         }
      }
      return bases.map((b) => new Building(b));
   }
   #generateTrees(){
      const points = [
         ...this.roadBorders.map((s) => [s.p1,s.p2]).flat(),
         ...this.buildings.map((b) => b.base.points).flat(),
      ];
      const left = Math.min(...points.map((point) => point.x));
      const right = Math.max(...points.map((point) => point.x));
      const top = Math.min(...points.map((point) => point.y));
      const bottom = Math.max(...points.map((point) => point.y));
      const illegalPolys = [
         ...this.buildings.map((b) => b.base),
         ...this.envelopes.map((event) => event.poly),
      ];
      const trees = [];
      let tryCount = 0;
      while(tryCount < 100){
         const point = new Point(
            lerp(left,right,Math.random()),
            lerp(bottom,top,Math.random()),
         );
         let keep = true;
         for(const poly of illegalPolys){
            if(poly.containsPoint(point) || poly.distanceToPoint(point) < this.treeSize / 2){
               keep = false;
               break;
            }
         }
         if(keep){
            for(const tree of trees){
               if(distance(tree.center,point) < this.treeSize){
                  keep = false;
                  break;
               }
            }
         }
         if(keep){
            let closeToSomething = false;
            for(const poly of illegalPolys){
               if(poly.distanceToPoint(point) < this.treeSize * 2){
                  closeToSomething = true;
                  break;
               }
            }
            keep = closeToSomething;
         }
         if(keep){
            trees.push(new Tree(point,this.treeSize));
            tryCount = 0;
         }
         tryCount++;
      }
      return trees;
   }
   generate(){
      this.envelopes.length = 0;
      for(const segment of this.graph.segments){
         this.envelopes.push(new Envelope(segment,this.roadWidth,this.roadRoundness));
      }
      this.roadBorders = Polygon.union(this.envelopes.map((event) => event.poly));
      this.buildings = this.#generateBuildings();
      this.trees = this.#generateTrees();
      this.laneGuides.length = 0;
      this.laneGuides.push(...this.#generateLaneGuides());
   }
   #getIntersections(){
      const subset = [];
      for(const point of this.graph.points){
         let degree = 0;
         for(const segment of this.graph.segments){
            if(segment.includes(point)) degree++;
         }
         if(degree > 2){
            subset.push(point);
         }
      }
      return subset;
   }
   #updateLights(){
      const lights = this.markings.filter((m) => m instanceof Light);
      const controlCenters = [];
      for(const light of lights){
         const point = getNearestPoint(light.center,this.#getIntersections());
         let controlCenter = controlCenters.find((c) => c.equals(point));
         if(!controlCenter){
            controlCenter = new Point(point.x,point.y);
            controlCenter.lights = [light];
            controlCenters.push(controlCenter);
         }else{
            controlCenter.lights.push(light);
         }
      }
      const greenDuration = 2;
      const yellowDuration = 1;
      for(const center of controlCenters){
         center.ticks = center.lights.length * (greenDuration + yellowDuration);
      }
      const tick = Math.floor(this.frameCount / 60);
      for(const center of controlCenters){
         const cTick = tick % center.ticks;
         const greenYellowIndex = Math.floor(cTick / (greenDuration + yellowDuration));
         const greenYellowState = cTick % (greenDuration + yellowDuration) < greenDuration ? "green" : "yellow";
         for(let i = 0;i < center.lights.length;i++){
            if(i == greenYellowIndex){
               center.lights[i].state = greenYellowState;
            }else{
               center.lights[i].state = "red";
            }
         }
      }
      this.frameCount++;
   }
   draw(ctx,viewPoint,showStartMarkings = true,renderRadius = 1000){
      this.#updateLights();
      for(const envelope of this.envelopes){
         envelope.draw(ctx,{ fill: "#BBB",stroke: "#BBB",lineWidth: 15});
      }
      for(const marking of this.markings){
         if(!(marking instanceof Start) || showStartMarkings){
            marking.draw(ctx);
         }
      }
      for(const segment of this.graph.segments){
         segment.draw(ctx,{ color: "white",width: 4,dash: [10,10]});
      }
      for(const segment of this.roadBorders){
         segment.draw(ctx,{ color: "white",width: 4});
      }
      ctx.globalAlpha = 0.2;
      for(const car of this.cars){
         car.draw(ctx);
      }
      ctx.globalAlpha = 1;
      if(this.bestCar){
         this.bestCar.draw(ctx,true);
      }
      const items = [...this.buildings,...this.trees].filter((index) => index.base.distanceToPoint(viewPoint) < renderRadius);
      items.sort((a,b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint));
      for(const item of items){
         item.draw(ctx,viewPoint);
      }
   }
}