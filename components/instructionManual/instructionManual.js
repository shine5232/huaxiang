Component({
  data: {
  },
  lifetimes: {
    attached() {
      let that = this;
      let observer = that.createIntersectionObserver();
      observer.relativeTo('.scroll-view').observe('.bottom', (res) => {
        let appear = res.intersectionRatio > 0;
        that.triggerEvent('myevent', appear);
      });
    },
  }
});