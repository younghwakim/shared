// 소개 페이지 공통 등장 연출. 아래 구간이 화면에 들어올 때 글·그림이 차례로 올라온다.
// 자바스크립트가 없거나 움직임 줄이기를 켠 사람에게는 처음부터 다 보인다. 페이지가 직접 움직이는 요소는 건드리지 않는다.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var SKIP = 'video,canvas,script,style,svg,button,a,input,select,textarea,[data-no-reveal]';
  function blocks(el, depth, out) {
    var kids = Array.prototype.filter.call(el.children, function (k) { return !k.matches('script,style'); });
    var hasText = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    var wrapper = kids.length > 1 && !hasText && depth < 3 && /^(DIV|SECTION|UL|OL|ARTICLE|MAIN)$/.test(el.tagName);
    if (wrapper) { kids.forEach(function (k) { blocks(k, depth + 1, out); }); return; }
    out.push(el);
  }
  function ready() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section, body > section'));
    sections = sections.filter(function (s, i) { return !s.parentElement.closest('section') && s.getBoundingClientRect().top > innerHeight * 0.85; });
    sections.forEach(function (sec) {
      var list = []; Array.prototype.forEach.call(sec.children, function (k) { if (!k.matches('script,style')) blocks(k, 0, list); });
      list = list.filter(function (e) {
        if (e.matches(SKIP) && !e.matches('a,button')) return false;
        var cs = getComputedStyle(e);
        return cs.position !== 'absolute' && cs.position !== 'fixed' && cs.display !== 'none' && +cs.opacity === 1 && cs.animationName === 'none' && e.getBoundingClientRect().height > 0;
      });
      list.forEach(function (e, i) {
        var d = Math.min(i, 7) * 70, media = e.matches('img,figure') || e.querySelector(':scope > img');
        e.style.opacity = '0';
        e.style.translate = '0 ' + (media ? 44 : 22) + 'px';
        e.__labs = d;
      });
      var show = function () {
        list.forEach(function (e) {
          var keep = e.style.transition;
          e.style.transition = 'opacity .55s ease ' + e.__labs + 'ms, translate .75s cubic-bezier(.2,1,.3,1) ' + e.__labs + 'ms';
          e.style.opacity = ''; e.style.translate = '';
          // 끝나면 페이지 본래의 움직임(누를 때 등)을 돌려준다
          setTimeout(function () { e.style.transition = keep; }, e.__labs + 800);
        });
      };
      var io = new IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); show(); } }, { rootMargin: '0px 0px -12% 0px' });
      io.observe(sec);
      // 인쇄·검색 저장 때 빈칸으로 남지 않게
      window.addEventListener('beforeprint', show, { once: true });
    });
  }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
})();
