import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

/**
 * DRC模型加载器
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
function loadDrc(url,scene) {
  // 设置加载器
  let dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
  // 渲染drc文件
  function loadFile(loadfile) {
    let reader = new FileReader();
    reader.onload = function(e) {
      dracoLoader.decodeDracoFile(reader.result, function(bufferGeometry) {
        
        var material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 1,
          linecap: 'round', //ignored by WebGLRenderer
          linejoin:  'round' 
        });

        var geometry;
        // Point cloud does not have face indices.
        if (bufferGeometry.index == null) {
          geometry = new THREE.Points(bufferGeometry, material);
        } else {
          // if (bufferGeometry.attributes.normal === undefined) {
          //   var geometryHelper = new GeometryHelper();
          //   geometryHelper.computeVertexNormals(bufferGeometry);
          // }
          // geometry = new THREE.Mesh(bufferGeometry, material);
          geometry = new THREE.Line(bufferGeometry, material);
        }
        // Compute range of the geometry coordinates for proper rendering.
        bufferGeometry.computeBoundingBox();
        var sizeX = bufferGeometry.boundingBox.max.x - bufferGeometry.boundingBox.min.x;
        var sizeY = bufferGeometry.boundingBox.max.y - bufferGeometry.boundingBox.min.y;
        var sizeZ = bufferGeometry.boundingBox.max.z - bufferGeometry.boundingBox.min.z;
        var diagonalSize = Math.sqrt(sizeX * sizeX + sizeY * sizeY + sizeZ * sizeZ);
        var scale = 1.0 / diagonalSize;
        var midX =
          (bufferGeometry.boundingBox.min.x + bufferGeometry.boundingBox.max.x) / 2;
        var midY =
          (bufferGeometry.boundingBox.min.y + bufferGeometry.boundingBox.max.y) / 2;
        var midZ =
          (bufferGeometry.boundingBox.min.z + bufferGeometry.boundingBox.max.z) / 2;

        geometry.scale.multiplyScalar(scale);
        geometry.position.x = -midX * scale;
        geometry.position.y = -midY * scale;
        geometry.position.z = -midZ * scale;
        geometry.castShadow = true;
        geometry.receiveShadow = true;

        var selectedObject = scene.getObjectByName("my_mesh");
        scene.remove(selectedObject);
        geometry.name = "my_mesh";
        scene.add(geometry);
      });
    }
    reader.readAsArrayBuffer(loadfile)
  }
  // 加载drc文件
  function downloadEncodedMesh(filename) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename, true);
    xhr.responseType = "blob";
    xhr.onload = function (event) {
      const arrayBuffer = xhr.response;
      if (arrayBuffer) {
        loadFile(arrayBuffer)
      }
    };
    xhr.send(null);
  }
  downloadEncodedMesh(url.url)
}

export default loadDrc