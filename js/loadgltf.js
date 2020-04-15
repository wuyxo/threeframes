import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

/**
 * GLTF模型加载器
 * @params $category 加载模型的类型
 * @params $url 加载模型需要传递的参数
 ** @params $url 模型的url地址
 ** @params $textureImgUrl 加载贴图的地址
 ** @params $isPoint 是否为点
 *** @params $isPoint 布尔值 true为点 false为线
 *** @params $color 点或者线的颜色
 *** @params $size 点的大小设置
 ** @params $position 模型和线框的位置设置
 *** @params $x 模型的x轴
 *** @params $y 模型的y轴
 *** @params $z 模型的z轴
 *** @params $rotateX 模型绕x轴旋转
 *** @params $rotateY 模型绕y轴旋转
 *** @params $rotateZ 模型绕z轴旋转
 *** @params $scale 模型缩放比例设置
 *** @params $color 模型颜色设置
 *** @params $opacity 模型透明度设置
 * @params $scene 传递的THREEJS场景
 */
function loadGltf(url,scene) {
  let texture
  // 是否加载贴图
  if(url.textureImgUrl!==""){
    let textureLoader = new THREE.TextureLoader()
    texture = textureLoader.load(url.textureImgUrl)
  }
  let gltfLoader = new GLTFLoader()
  // 解压缩
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  dracoLoader.preload();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    url.url, 
    function (collada) {
      // collada.scene 为当前加载的场景
      collada.scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          // 贴图
          if(url.textureImgUrl!==""){
            child.material = new THREE.MeshBasicMaterial({
              map: texture,
              color:url.position.color,
              transparent: true,
              opacity: url.position.opacity,
              depthTest: true,
              side: THREE.DoubleSide,
              wireframeLinewidth: 1
            })
          }else{
            child.material = new THREE.MeshBasicMaterial({
              color:url.position.color,
              transparent: true,
              opacity: url.position.opacity,
              depthTest: true,
              side: THREE.DoubleSide,
              wireframeLinewidth: 1
            })
          }
          // 绘制边缘线
          let edges = new THREE.EdgesGeometry(child.geometry)
          let line
          if(url.isPoint.isPoint){
            line = new THREE.Points(edges, new THREE.PointsMaterial({
              color: url.isPoint.color,
              size: url.isPoint.size,
              morphTargets: true
            }))
          }else{
            line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
              color: url.isPoint.color 
            }))
          }
          line.scale.multiplyScalar(url.position.scale)
          line.position.x += url.position.x
          line.position.z += url.position.x
          line.position.y += url.position.x
          line.rotation.x = url.position.rotateX
          line.rotation.y = url.position.rotateY
          line.rotation.z = url.position.rotateZ
          scene.add(line)
        }
      })
      // 线框助手 两侧可见
      let wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(collada));
      wireframe.material.depthTest = false
      wireframe.material.opacity = url.position.opacity;
      wireframe.material.transparent = true
      collada.scale.multiplyScalar(url.position.scale)
      collada.position.x += url.position.x
      collada.position.z += url.position.x
      collada.position.y += url.position.x
      collada.rotation.x = url.position.rotateX
      collada.rotation.y = url.position.rotateY
      collada.rotation.z = url.position.rotateZ
      // 设置物体的材质
      scene.add(collada);
    },
    function(){
      // 加载进度
    },
    function(){
      // 加载错误
      console.log('Load OBJ Model Error')
    }
  )
}

export default loadGltf