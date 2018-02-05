import InfiniteScroller from './infinite-scroll'
import '../../css/index.css'
import fakeData from './message'
import {
  $
} from '@mfelibs/base-utils'
import tools from '../../js/tools'
import Stats from '../../js/stats.js'

var statusPanel  = new tools();
var totalNum = 0;


var INIT_TIME = new Date().getTime();
var page = 1;

function ContentSource() {
  // Collect template nodes to be cloned when needed.
  //   this.tombstone_ = document.querySelector(".j_tombstone");
  //   this.messageTemplate_ = document.querySelector(".j_template");

  this.tombstone_ = document.querySelector(".j_template");
  //   this.tombstone_ = document.querySelector("#templates > .chat-item.tombstone");
  //   this.messageTemplate_ = document.querySelector("#templates > .chat-item:not(.tombstone)");
  this.messageTemplate_ = document.querySelector(".j_msg");
  this.nextItem_ = 0;
}

ContentSource.prototype = {
  fetch: function(count) {
    // Fetch at least 30 or count more objects for display.
    count = Math.max(30, count);
    return new Promise(function(resolve, reject) {
      // Assume 50 ms per item.
      // setTimeout(function() {
      //   var items = [];
      //   for (var i = 0; i < Math.abs(count); i++) {
      //     items[i] = getItem(this.nextItem_++);
      //   }
      //   resolve(Promise.all(items));
      // }.bind(this), 1000 /* Simulated 1 second round trip time */ );

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
              console.log(item.id);
            }
          })
          totalNum = totalNum + data.length;
          statusPanel.addItem('Total_data_number', totalNum);
          resolve(data);
        }
      })

    }.bind(this));
  },

  createTombstone: function() {
    return this.tombstone_.cloneNode(true);
  },

  render: function(item, div) {
    // TODO: Different style?

    div = div || this.messageTemplate_.cloneNode(true);
    div.dataset.id = item.id;
    item.pic && (div.querySelector('.news_img > img').src = item.pic);
    item.sourcepic && (div.querySelector('.news_author_img > img').src = item.sourcepic);
    div.querySelector('.news_author_name').textContent = item.source;
    div.querySelector('.news_h1').textContent = item.title;
    div.querySelector('.news_p').textContent = item.intro;

    // var img = div.querySelector('.bubble img');
    // if (item.image !== '') {
    //   img.classList.remove('invisible');
    //   img.src = item.image.src;
    //   img.width = item.image.width;
    //   img.height = item.image.height;
    // } else {
    //   img.src = '';
    //   img.classList.add('invisible');
    // }

    // if (item.self) {
    //   div.classList.add('from-me');
    // } else {
    //   div.classList.remove('from-me');
    // }
    return div;
  },
};

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
  $(domPanel.dom).show(); // ios手机上不显示、临时处理
  document.body.appendChild(stats.dom);
  var TIMEOUT = 100;
  setTimeout(function timeoutFunc() {
    // Only update DOM node graph when we have time to spare to call
    // numDomNodes(), which is a fairly expensive function.
    window.requestIdleCallback ?
      requestIdleCallback(function() {
        domPanel.update(numDomNodes(document.body), 1500);
        setTimeout(timeoutFunc, TIMEOUT);
      }) :
      setInterval(function() {
        domPanel.update(numDomNodes(document.body), 1500)
      }, 500)
  }, TIMEOUT);


});



