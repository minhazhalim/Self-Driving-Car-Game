class Visualizer {
     static drawNetwork(zim,network){
          const margin = 50;
          const top = margin;
          const left = margin;
          const width = zim.canvas.width - margin * 2;
          const height = zim.canvas.height - margin * 2;
          const levelHeight = height / network.levels.length;
          for(let i = network.levels.length - 1;i >= 0;i--){
               const levelTop = top+ lerp(height - levelHeight,0,network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1));
               zim.setLineDash([7,3]);
               Visualizer.drawLevel(zim,network.levels[i],left,levelTop,width,levelHeight,i == network.levels.length - 1 ? ['🠉','🠈','🠊','🠋'] : []);
          }
     }
     static drawLevel(zim,level,left,top,width,height,outputLabels){
          const right = left + width;
          const bottom = top + height;
          const {inputs,outputs,weights,biases} = level;
          for(let i = 0;i < inputs.length;i++){
               for(let j = 0;j < outputs.length;j++){
                    zim.beginPath();
                    zim.moveTo(Visualizer.#getNodeX(inputs,i,left,right),bottom);
                    zim.lineTo(Visualizer.#getNodeX(outputs,j,left,right),top);
                    zim.lineWidth = 2;
                    zim.strokeStyle = getRGBA(weights[i][j]);
                    zim.stroke();
               }
          }
          const nodeRadius = 18;
          for(let i = 0;i < inputs.length;i++){
               const x = Visualizer.#getNodeX(inputs,i,left,right);
               zim.beginPath();
               zim.arc(x,bottom,nodeRadius,0,Math.PI * 2);
               zim.fillStyle = 'black';
               zim.fill();
               zim.beginPath();
               zim.arc(x,bottom,nodeRadius * 0.6,0,Math.PI * 2);
               zim.fillStyle = getRGBA(inputs[i]);
               zim.fill();
          }
          for(let i = 0;i < outputs.length;i++){
               const x = Visualizer.#getNodeX(outputs,i,left,right);
               zim.beginPath();
               zim.arc(x,top,nodeRadius,0,Math.PI * 2);
               zim.fillStyle = 'black';
               zim.fill();
               zim.beginPath();
               zim.arc(x,top,nodeRadius * 0.6,0,Math.PI * 2);
               zim.fillStyle = getRGBA(outputs[i]);
               zim.fill();
               zim.beginPath();
               zim.lineWidth = 2;
               zim.arc(x,top,nodeRadius * 0.8,0,Math.PI * 2);
               zim.strokeStyle = getRGBA(biases[i]);
               zim.setLineDash([3,3]);
               zim.stroke();
               zim.setLineDash([]);
               if(outputLabels[i]){
                    zim.beginPath();
                    zim.textAlign = 'center';
                    zim.textBaseline = 'middle';
                    zim.fillStyle = 'black';
                    zim.strokeStyle = 'white';
                    zim.font = (nodeRadius * 1.5) + 'px Arial';
                    zim.fillText(outputLabels[i],x,top + nodeRadius * 0.1);
                    zim.lineWidth = 0.5;
                    zim.strokeText(outputLabels[i],x,top + nodeRadius * 0.1);
               }
          }
     }
     static #getNodeX(nodes,index,left,right){
          return lerp(left,right,nodes.length == 1 ? 0.5 : index / (nodes.length - 1));
     }
}