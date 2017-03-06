
var YolpOptLayers = {

  // レイヤーセット切替時にクレジット表記を変更する
  layersetchanged(newLayerSet, oldLayerSet, map) {
    Object.entries(map.getLayerSets()).forEach(function(kv){
      var layerSet = kv[1];
      if (layerSet.changed) {
        layerSet.changed(newLayerSet, oldLayerSet);
      }
    });
  },

  createOpenStreetMapLayerSet(name) {
    return this.createLayerSet(name, this.createOpenStreetMapLayer());
  },

  createChiriinChizuLayerSet(name) {
    return this.createLayerSet(name, this.createChiriinChizuLayer());
  },

  createLayerSet(name, layer) {

    var layerSet = new Y.LayerSet(name, [layer]);

    layerSet.copyrightControl = layer.createCopyrightControl();

    layerSet.changed = function(newLayerSet, oldLayerSet) {
      var map = this.getLayers()[0].getMap();
      if (oldLayerSet && this.getName() === oldLayerSet.getName()) {
        map.removeControl(this.copyrightControl);
      }
      if (newLayerSet && this.getName() === newLayerSet.getName()) {
        map.addControl(this.copyrightControl);
      }
    };

    return layerSet;
  },

  // OpenStreetMap の地図を表示するレイヤーを生成する
  createOpenStreetMapLayer() {

    var self = this;
    var layer = new Y.ImageTileLayer();

    layer.getImageSrc = function(x, y, z) {
      // 地図画像タイル座標を計算
      var t = self.calc(x, y, z);
      // 地図画像タイルアクセスをサブドメインに分散させる
      var subdomains = ['a', 'b', 'c'];
      var subdomain = subdomains[x % 3];
      // 地図画像タイル画像URLを組み立てる
      var url = 'http://' + subdomain + '.tile.openstreetmap.org/' + t.z + '/' + t.x + '/' + t.y + '.png';
      return url;
    };

    layer.createCopyrightControl = function() {
      return new YolpOptLayers.CopyrightControl('© <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors');
    };

    return layer;
  },

  // 地理院地図の地図を表示するレイヤーを生成する
  createChiriinChizuLayer() {

    var self = this;
    var layer = new Y.ImageTileLayer();

    layer.getImageSrc = function(x, y, z) {
      // 地図画像タイル座標を計算
      var t = self.calc(x, y, z);
      // 地図画像タイル画像URLを組み立てる
      var url = 'http://cyberjapandata.gsi.go.jp/xyz/std/' + t.z + '/' + t.x + '/' + t.y + '.png';
      return url;
    };

    layer.createCopyrightControl = function() {
      return new YolpOptLayers.CopyrightControl('出典: <a href="http://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>');
    };

    return layer;
  },

  // YOLP地図画像タイル座標を、OSMや地理院地図のタイル座標に変換する
  calc(x, y, z) {
    t = {};
    t.x = x;
    t.z = z - 1;
    t.y = Math.floor((y + 0.5) * -1 + Math.pow(2, t.z) / 2);
    return t;
  }
};

// クレジット表示用のコントロール
YolpOptLayers.CopyrightControl = function(labelHtml) {
  this.labelHtml = labelHtml;
};

YolpOptLayers.CopyrightControl.prototype = new Y.Control();

YolpOptLayers.CopyrightControl.prototype.getDefaultPosition = function() {
  return new Y.ControlPosition(Y.ControlPosition.BOTTOM_LEFT, new Y.Size(0, 0));
};

YolpOptLayers.CopyrightControl.prototype.initialize = function(map) {
  var e = document.createElement('div');
  e.innerHTML = this.labelHtml;
  e.style.fontWeight = 'bold';
  e.style.fontSize = '12px';
  e.style.fontFamily = 'Arial';
  e.style.textAlign = 'left';
  e.style.padding = '0px';
  e.style.margin = '0px';
  e.style.color = 'black';
  return e;
};

