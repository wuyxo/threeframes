import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import loadObj from './loadobj'
import loadDrc from './loaddrc'

/** 
 * 创建场景加载模型
 * @param $con 页面中容器的id，用来放置渲染的模型
 * @param $constant 页面中有时候需要用到的监测量
 * @param $axesHelper 是否开启坐标辅助
 * @param $cameraHelper 是否开启相机辅助
 * @param $gridHelper 是否开启网格辅助
 * @param $objUrl 加载模型的URL
 * @param
 * @param
 * @param
 */
function createScene(con,constant,axesHelper,cameraHelper,gridHelper,modelUrl) {
  if(THREE===undefined){return console.log('THREE is not defined')}
  // 自定义常量
  let constantArr = []
  if(constant.length!==0){
    for(let i=0;i<constant.length;i++){
      let obj = {
        name:'constant' + i,
        value: constant[i]
      }
      constantArr.push(obj)
    }
  }
  // 设置场景
  let scene = new THREE.Scene()
  // 是否开启坐标辅助
  if(axesHelper){
    var axesHelper = new THREE.AxesHelper( 80 )
    scene.add( axesHelper )
  }
  // 是否开启坐标格辅助
  if(gridHelper){
    var size = 40
    var divisions = 40
    var gridHelper = new THREE.GridHelper( size, divisions )
    scene.add( gridHelper )
  }
  // 设置相机
	let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200000)
  camera.position.set(100,100,100)
  // 是否开启相机辅助
  if(cameraHelper){
    var cameraHelper = new THREE.CameraHelper( camera );
    scene.add( cameraHelper )
  }
  // 设置渲染器
	let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 设置渲染容器
  let container = document.getElementById(con)
	container.appendChild(renderer.domElement)
  let control = new OrbitControls(camera, renderer.domElement)
  // 加入灯光
  let shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	scene.add(shadowLight)
  // 加载模型
  switch (modelUrl.category) {
    case 'obj':
      loadObj(modelUrl,scene)
      break;
    case 'drc':
      loadDrc(modelUrl,scene)
      break;
    default:
      break;
  }
  // 鼠标射线监控
  let raycaster = new THREE.Raycaster()
  // 新建一个Vector2对象保存鼠标位置信息,监听鼠标移动事件
	let mouse = new THREE.Vector2()
  function onMouseMove(event) {
    event.preventDefault()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera)
    raycaster.set(camera.position, vector.sub(camera.position).normalize())
    var intersects = raycaster.intersectObjects(scene.children, true)
    if(intersects.length!==0){
      console.log('场景中有物体')
    }else{
      console.log('场景中没有物体')
    }
  }
  window.addEventListener('mousemove', onMouseMove, false)
  // 页面大小监控
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  // 启动动画
  function animate() {
    control.update()
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}

export default createScene