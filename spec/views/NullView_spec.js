define(['views/NullView'],
        function (NullView) {

  describe('Null View', function () {
    var nullView;

    describe('rendering', function () {

      it('renders nothing', function () {
        nullView = new NullView();
        nullView.render();
        expect(nullView.$el.children().length).toBe(0);
      });
    });
  });
});
