<style scoped>
.vue-damp-fireworks-wrap{
  position: relative;
  margin: 0 auto;
}
.canvasBox {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  overflow: hidden;
}
#canvas {
  height: 100%;
}
</style>

<template>
  <div
    class="vue-damp-fireworks-wrap"
    :style="`
      height: ${canvasBoxHeight};
      width: ${canvasBoxWidth};
    `"
  >
    <div class="canvasBox">
      <canvas id="canvas"></canvas>
    </div>
    <slot></slot>
  </div>
</template>

//导出组件名*
<script>
export default{
    name:'vue-damp-fireworks'
}
</script> 

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  boxHeight: {
    type: Number,
    default: window.innerHeight - 104
  },
  boxWidth: {
    type: Number,
    default: window.innerWidth
  },
  duration: {
    type: Number,
    default: 0
  }
})
const seedAmount=ref(0)
const seeds = ref([])
const particles = ref([])
const auto = ref(true)
const boxHeight=ref(props.boxHeight)
const boxWidth=ref(props.boxWidth)

const canvas=computed(()=>document.getElementById('canvas'))
const ctx=computed(()=>{
  if (canvas.value !== undefined) {
    return canvas.value.getContext('2d');
  }

  return null;
})
const canvasBoxHeight=computed(()=>{
  if (boxHeight.value){
    if (typeof boxHeight.value === 'number' || typeof boxHeight.value === 'string'){
      return `${boxHeight.value}px`
    }
    return ''
  }
})
const canvasBoxWidth=computed(()=>{
  if (boxWidth.value){
    if (typeof boxWidth.value === 'number' || typeof boxWidth.value === 'string'){
      return `${boxWidth.value}px`
    }
    return ''
  }
})

const init = () => {
  canvas.value.width = boxWidth.value;
  canvas.value.height = boxHeight.value;
}

const loop = () => {
  if (ctx.value !== undefined) {
    clearCanvas();
    ctx.value.globalCompositeOperation = 'lighter';

    for (let i = 0; i < seeds.value.length; i += 1) {
      if (!seeds.value[i].dead) {
        seeds.value[i].move();
        seeds.value[i].draw();
      } else {
        seeds.value.splice(i, 1);
      }
    }

    for (let i = 0; i < particles.value.length; i += 1) {
      if (!particles.value[i].dead) {
        particles.value[i].move();
        particles.value[i].draw();
      } else {
        particles.value.splice(i, 1);
      }
    }

    if (auto.value && (seedAmount.value % 40) === 0) {
      const seed =
        Seed(
          randomInt(20, boxWidth .value- 20),
          boxHeight.value - 20,
          randomInt(175, 185),
          [randomInt(0, 359), '100%', '50%'],
        );
      seeds.value.push(seed);
    }

    ctx.value.globalCompositeOperation = 'destination-out';
    requestAnimationFrame(loop);
    seedAmount.value += 1;
  }
}

const clearCanvas = () => {
  if (ctx.value !== undefined) {
    ctx.value.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.value.fillRect(0, 0, props.boxWidth, props.boxHeight);
  }
}

const circle = (x, y, radius) => {
  if (ctx.value !== undefined) {
    ctx.value.beginPath();
    ctx.value.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.value.closePath();
  }
}

const Seed = (x, y, angle, color) => {
  const acceleration = 0.05;
  const radius = 3;
  const h = color[0];
  const s = color[1];
  const l = color[2];
  const finalColor = `hsla(${h}, ${s}, ${l}, 1)`

  const dead = false;
  const fireSeed = {};
  let speed = 2;

  fireSeed.x = x;
  fireSeed.y = y;
  fireSeed.move = () => {
    if (fireSeed.y > randomInt(100, 200)) {
      speed += acceleration;
      fireSeed.x += speed * Math.sin((Math.PI / 180) * angle);
      fireSeed.y += speed * Math.cos((Math.PI / 180) * angle);
    } else if (!dead) {
      fireSeed.explode();
      fireSeed.dead = true;
    }
  };
  fireSeed.draw = () => {
    ctx.value.fillStyle = finalColor;
    circle(fireSeed.x, fireSeed.y, radius);
    ctx.value.fill();
  };
  fireSeed.explode = () => {
    for (let i = 0; i < 359; i += 4) {
      const particle =
        Firework(fireSeed.x, fireSeed.y, i + (randomInt(-200, 200) / 100), [h, s, l]);
      particles.value.push(particle);
    }
  };
  fireSeed.dead = dead;
  return fireSeed;
}

const Firework = (x, y, angle, color) => {
  const fireSeed = {};
  const angleOffset = randomInt(-20, 20) / 100;
  const radius = 1;
  const acceleration = -0.01;
  const gravity = 0.01;

  let opacity = 1;
  let finalColor = `hsla(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
  let verticalSpeed = 0;
  let speed = randomInt(195, 205) / 100;
  let targetAngle = angle;
  let positionX = x;
  let positionY = y;
  fireSeed.dead = false;
  fireSeed.move = () => {
    if (opacity > 0) {
      if (speed > 0) {
        speed += acceleration;
      }

      targetAngle += angleOffset;
      opacity -= 0.005;
      finalColor = `hsla(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
      verticalSpeed += gravity;
      positionX += speed * Math.sin((Math.PI / 180) * targetAngle);
      positionY += (speed * Math.cos((Math.PI / 180) * targetAngle)) + verticalSpeed;
    } else if (!fireSeed.dead) {
      fireSeed.dead = true;
    }
  };
  fireSeed.draw = () => {
    ctx.value.fillStyle = finalColor;
    circle(positionX, positionY, radius);
    ctx.value.fill();
  };

  return fireSeed;
}

const randomInt = (min, max) => {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

onMounted(()=>{
  init()
  loop()
  if(props.duration){
    setTimeout(()=>{
      auto.value=false
    },props.duration)
  }
  window.addEventListener('click', (event) => {
    const seed = Seed(event.pageX, event.pageY, self.randomInt(175, 185), [self.randomInt(0, 359), '100%', '50%']);
    seeds.value.push(seed);
  });
  window.addEventListener('resize', () => {
    boxWidth.value = window.innerWidth;
    // boxHeight.value = window.innerHeight;
    canvas.value.width = boxWidth.value
    clearCanvas();
  });
})
</script>