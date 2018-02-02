import InfiniteScroller from './infinite-scroll2';
import fakeData from './message';
import '../../css/index.css';
import Stats from './stats.min.js'

import {
  $
} from '@mfelibs/base-utils'

var INIT_TIME = new Date().getTime();
var page = 1;
/**
 * Constructs a random item with a given id.
 * @param {number} id An identifier for the item.
 * @return {Object} A randomly generated item.
 */
function getItem(id) {
  function pickRandom(a) {
    return a[Math.floor(Math.random() * a.length)];
  }

  return new Promise(function(resolve) {
    var item = {
      id: id,
      avatar: Math.floor(Math.random() * NUM_AVATARS),
      self: Math.random() < 0.1,
      image: Math.random() < 1.0 / 20 ? Math.floor(Math.random() * NUM_IMAGES) : '',
      time: new Date(Math.floor(INIT_TIME + id * 20 * 1000 + Math.random() * 20 * 1000)),
      message: pickRandom(MESSAGES)
    }
    if (item.image == '') {
      resolve(item);
    } else {
      var image = new Image();
      image.src = 'images/image' + item.image + '.jpg';
      image.addEventListener('load', function() {
        item.image = image;
        resolve(item);
      });
      image.addEventListener('error', function() {
        item.image = '';
        resolve(item);
      });
    }
  });
}

function ContentSource() {
  // Collect template nodes to be cloned when needed.
  //   this.tombstone_ = document.querySelector(".j_tombstone");
  //   this.messageTemplate_ = document.querySelector(".j_template");

  this.tombstone_ = document.querySelector(".j_tombstone");
  //   this.tombstone_ = document.querySelector("#templates > .chat-item.tombstone");
  //   this.messageTemplate_ = document.querySelector("#templates > .chat-item:not(.tombstone)");
  this.messageTemplate_ = document.querySelector(".j_msg");
  this.messageTemplate2_ = document.querySelector(".j_msg_2");
  this.nextItem_ = 0;
  this.noData = 0; // 测试使用  避免多次请求空接口
}

ContentSource.prototype = {
  fetch: function(count) {
    // Fetch at least 30 or count more objects for display.
    count = Math.max(30, count);
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!this.noData) {
        $.ajax({
          url: 'https://interface.sina.cn/tech/simple_column.d.json?native=0&col=51901',
          data: {
            'page': page,
            'size': 20
          },
          dataType: 'jsonp',
          success: function(data, status) {
            if (data.length == 0) {
              console.log(0);
              self.noData = 1;
              let localFakeData = JSON.parse(JSON.stringify(fakeData))
              localFakeData.forEach((item) => {
                item.id = item.id + (new Date() - 0);
                item.title = parseInt(Math.random() * 10) + ', ' + item.title;
              })
              data = localFakeData;
            }
            page = page + 1;
            data.forEach((item) => {
              item.fn = function() {
                console.log(item.id)
              }
              // 构造虚假模板选择
              var randomNum = Math.random();
              if (randomNum < 0.3) {
                item.randomModule = 'type1'
              } else if (randomNum < 0.7) {
                item.randomModule = 'type2'
              } else {
                item.randomModule = 'type3'
              }
            })
            resolve(data);
          }
        })
      } else {
        console.log(0);
        let localFakeData = JSON.parse(JSON.stringify(fakeData))
        localFakeData.forEach((item) => {
          item.id = item.id + (new Date() - 0);
          item.title = parseInt(Math.random() * 10) + ', ' + item.title;
          item.fn = function() {
            console.log(item.id);
          }
          // 构造虚假模板选择
          var randomNum = Math.random();
          if (randomNum < 0.3) {
            item.randomModule = 'type1'
          } else if (randomNum < 0.7) {
            item.randomModule = 'type2'
          } else {
            item.randomModule = 'type3'
          }
        })
        setTimeout(function() {
          resolve(localFakeData);
        }, 500);
      }

    }.bind(this));
  },

  createTombstone: function() {
    return this.tombstone_.cloneNode(true);
  },

  render: function(item, divObj) {
    var templateType = item.randomModule;
    if (!divObj) {
      if (templateType == "type1") {
        divObj = this.messageTemplate_.cloneNode(true);
      } else {
        divObj = this.messageTemplate2_.cloneNode(true);
      }
    }

    switch (templateType) {
      case 'type1':
        divObj = renderType1(item, divObj);
        break;
      case 'type2':
        divObj = renderType2(item, divObj);
        break;
      case 'type3':
      default:
        divObj = renderType2(item, divObj);
    }
    return divObj;
  },
};

function renderType1(item, div) {
  div.dataset.id = item.id;
  item.pic && (div.querySelector('.m_video_img_bg_img').src = item.pic)
  div.querySelector('.m_video_tit').textContent = item.title;
  return div
}

function renderType2(item, div) {
  div.dataset.id = item.id;
  item.pic && (div.querySelector('.m_f_div > img').src = item.pic)
  div.querySelector('h2').textContent = item.title;
  div.querySelector('.m_f_con_add').textContent = item.source;
  div.querySelector('.m_f_con_com_n').textContent = Math.floor(100 * Math.random());
  return div
}

function numDomNodes(node) {
  if (!node.children || node.children.length == 0)
    return 0;
  var childrenCount = Array.from(node.children).map(numDomNodes);
  return node.children.length + childrenCount.reduce(function(p, c) {
    return p + c;
  }, 0);
}

document.addEventListener('DOMContentLoaded', function() {
  window.scroller =
    new InfiniteScroller(
      document.querySelector('#chat-timeline'),
      new ContentSource()
    );

  var stats = new Stats();
  var domPanel = new Stats.Panel('DOM Nodes', '#0ff', '#002');
  stats.addPanel(domPanel);
  stats.showPanel(3);
  document.body.appendChild(stats.dom);
  var TIMEOUT = 100;
  setTimeout(function timeoutFunc() {
    // Only update DOM node graph when we have time to spare to call
    // numDomNodes(), which is a fairly expensive function.
    requestIdleCallback(function() {
      domPanel.update(numDomNodes(document.body), 1500);
      setTimeout(timeoutFunc, TIMEOUT);
    });
  }, TIMEOUT);


});